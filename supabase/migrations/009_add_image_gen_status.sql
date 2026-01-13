-- Migration 009: Add image generation moderation status to user_credits
-- Tracks whether user can generate images (lockouts only affect image gen, not other features)

ALTER TABLE public.user_credits
  ADD COLUMN image_gen_status TEXT NOT NULL DEFAULT 'active'
    CHECK (image_gen_status IN ('active', 'warned', 'restricted')),
  ADD COLUMN image_gen_locked_until TIMESTAMPTZ,
  ADD COLUMN image_gen_violations INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN image_gen_violations_24h INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN last_image_violation_at TIMESTAMPTZ;

-- Index for finding users with active lockouts (for scheduled unlock check)
CREATE INDEX idx_user_credits_image_locked
  ON public.user_credits(image_gen_locked_until)
  WHERE image_gen_locked_until IS NOT NULL;

-- Index for checking moderation status quickly
CREATE INDEX idx_user_credits_image_status
  ON public.user_credits(image_gen_status)
  WHERE image_gen_status != 'active';

COMMENT ON COLUMN public.user_credits.image_gen_status IS 'active=can generate, warned=first offense, restricted=locked out';
COMMENT ON COLUMN public.user_credits.image_gen_locked_until IS 'Timestamp when lockout expires (null if not locked)';
COMMENT ON COLUMN public.user_credits.image_gen_violations IS 'Total violation count (all time)';
COMMENT ON COLUMN public.user_credits.image_gen_violations_24h IS 'Rolling count of violations in last 24 hours';
