-- Migration 010: Create image generation moderation functions
-- Functions for checking status and recording violations

-- Function to check if user can generate images
CREATE OR REPLACE FUNCTION public.check_image_gen_status(p_user_id UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  status TEXT,
  locked_until TIMESTAMPTZ,
  message TEXT
) AS $$
DECLARE
  v_status TEXT;
  v_locked_until TIMESTAMPTZ;
BEGIN
  SELECT
    uc.image_gen_status,
    uc.image_gen_locked_until
  INTO v_status, v_locked_until
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'not_found'::TEXT, NULL::TIMESTAMPTZ, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Check if lockout has expired
  IF v_status = 'restricted' AND v_locked_until IS NOT NULL AND v_locked_until < NOW() THEN
    -- Auto-unlock expired lockouts
    UPDATE public.user_credits
    SET image_gen_status = 'warned', image_gen_locked_until = NULL
    WHERE user_id = p_user_id;

    v_status := 'warned';
    v_locked_until := NULL;
  END IF;

  CASE v_status
    WHEN 'active', 'warned' THEN
      RETURN QUERY SELECT TRUE, v_status, v_locked_until, NULL::TEXT;
    WHEN 'restricted' THEN
      RETURN QUERY SELECT FALSE, v_status, v_locked_until,
        'Image generation is temporarily unavailable. Try again after ' || to_char(v_locked_until, 'YYYY-MM-DD HH24:MI UTC');
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a violation and apply penalties
CREATE OR REPLACE FUNCTION public.record_image_violation(
  p_user_id UUID,
  p_violation_type TEXT,
  p_category TEXT,
  p_severity INTEGER,
  p_prompt_hash TEXT,
  p_prompt_length INTEGER DEFAULT NULL,
  p_error_detail TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  violation_id UUID,
  new_status TEXT,
  locked_until TIMESTAMPTZ,
  action_taken TEXT
) AS $$
DECLARE
  v_violation_id UUID;
  v_current_status TEXT;
  v_violations_24h INTEGER;
  v_total_violations INTEGER;
  v_violations_7d INTEGER;
  v_new_status TEXT;
  v_locked_until TIMESTAMPTZ;
  v_action TEXT := 'none';
BEGIN
  -- Get current user status
  SELECT
    image_gen_status,
    image_gen_violations_24h,
    image_gen_violations
  INTO v_current_status, v_violations_24h, v_total_violations
  FROM public.user_credits
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Insert violation record
  INSERT INTO public.user_violations (
    user_id, violation_type, category, severity,
    prompt_hash, prompt_length, error_detail, metadata
  )
  VALUES (
    p_user_id, p_violation_type, p_category, p_severity,
    p_prompt_hash, p_prompt_length, p_error_detail, p_metadata
  )
  RETURNING id INTO v_violation_id;

  -- Calculate new counts
  v_violations_24h := v_violations_24h + 1;
  v_total_violations := v_total_violations + 1;
  v_new_status := v_current_status;

  -- Count violations in last 7 days
  SELECT COUNT(*) INTO v_violations_7d
  FROM public.user_violations
  WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days';

  -- Apply penalties based on severity and count
  IF p_severity = 3 THEN
    -- Immediate 24h lockout for severity 3
    v_new_status := 'restricted';
    v_locked_until := NOW() + INTERVAL '24 hours';
    v_action := 'locked_24h_severity';
  ELSIF v_violations_7d >= 10 THEN
    -- 7 day lockout for 10+ violations in 7 days
    v_new_status := 'restricted';
    v_locked_until := NOW() + INTERVAL '7 days';
    v_action := 'locked_7d_threshold';
  ELSIF v_violations_24h >= 5 THEN
    -- 24h lockout for 5+ violations in 24h
    v_new_status := 'restricted';
    v_locked_until := NOW() + INTERVAL '24 hours';
    v_action := 'locked_24h_threshold';
  ELSIF v_violations_24h >= 3 THEN
    -- 1h lockout for 3+ violations in 24h
    v_new_status := 'restricted';
    v_locked_until := NOW() + INTERVAL '1 hour';
    v_action := 'locked_1h';
  ELSIF v_violations_24h >= 1 AND v_current_status = 'active' THEN
    -- First violation: warn
    v_new_status := 'warned';
    v_action := 'warned';
  END IF;

  -- Update user credits with new status
  UPDATE public.user_credits
  SET
    image_gen_status = v_new_status,
    image_gen_locked_until = v_locked_until,
    image_gen_violations_24h = v_violations_24h,
    image_gen_violations = v_total_violations,
    last_image_violation_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_violation_id, v_new_status, v_locked_until, v_action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset 24h violation counts (called by scheduled job)
CREATE OR REPLACE FUNCTION public.reset_image_violation_counts()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE public.user_credits
    SET image_gen_violations_24h = (
      SELECT COUNT(*) FROM public.user_violations v
      WHERE v.user_id = user_credits.user_id
        AND v.created_at > NOW() - INTERVAL '24 hours'
    )
    WHERE image_gen_violations_24h > 0
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (functions use SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.check_image_gen_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_image_violation TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_image_violation_counts TO authenticated;

COMMENT ON FUNCTION public.check_image_gen_status IS 'Check if user can generate images (auto-unlocks expired lockouts)';
COMMENT ON FUNCTION public.record_image_violation IS 'Record violation and apply automatic penalties';
COMMENT ON FUNCTION public.reset_image_violation_counts IS 'Reset rolling 24h violation counts (run daily)';
