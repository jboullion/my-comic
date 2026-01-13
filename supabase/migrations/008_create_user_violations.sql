-- Migration 008: Create user_violations table
-- Audit log of content policy violations (prompts stored as SHA-256 hash only for privacy)

CREATE TABLE public.user_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  violation_type TEXT NOT NULL CHECK (violation_type IN (
    'pre_filter',       -- Caught by local filter before API call
    'fal_rejection',    -- 422 from Fal.ai
    'manual'            -- Admin-flagged
  )),

  category TEXT,        -- From content_filters.category (nullable for fal_rejection)
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 3),

  -- Don't store actual prompt for privacy/legal reasons
  prompt_hash TEXT NOT NULL,  -- SHA-256 hash for deduplication
  prompt_length INTEGER,

  -- Additional context
  error_detail TEXT,          -- API error message (sanitized)
  metadata JSONB DEFAULT '{}', -- model, style, request_id, etc.

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for checking recent violations per user (most common query)
CREATE INDEX idx_user_violations_user_recent
  ON public.user_violations(user_id, created_at DESC);

-- Index for counting violations by severity
CREATE INDEX idx_user_violations_severity
  ON public.user_violations(severity, created_at DESC);

-- Index for deduplication (same user, same prompt)
CREATE INDEX idx_user_violations_dedupe
  ON public.user_violations(user_id, prompt_hash);

-- RLS: Users cannot see their own violations (admin-only via service role)
ALTER TABLE public.user_violations ENABLE ROW LEVEL SECURITY;

-- No public policies - service role bypasses RLS

COMMENT ON TABLE public.user_violations IS 'Audit log of content policy violations for image generation';
COMMENT ON COLUMN public.user_violations.prompt_hash IS 'SHA-256 hash of prompt - never store actual content';
COMMENT ON COLUMN public.user_violations.violation_type IS 'pre_filter=caught locally, fal_rejection=API rejected, manual=admin flagged';
