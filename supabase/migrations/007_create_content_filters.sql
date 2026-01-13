-- Migration 007: Create content_filters table
-- Stores regex patterns for blocking prohibited content in image generation prompts

CREATE TABLE public.content_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'illegal_content',    -- CSAM, terrorism-related
    'extreme_violence',   -- Gore, torture
    'hate_speech',        -- Slurs, discrimination
    'deceptive',          -- Deepfakes of real people
    'other'
  )),
  severity INTEGER NOT NULL DEFAULT 2 CHECK (severity BETWEEN 1 AND 3),
  -- 1 = warning only, 2 = strike, 3 = immediate lockout
  match_type TEXT NOT NULL DEFAULT 'regex' CHECK (match_type IN ('exact', 'regex', 'contains')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for loading active filters (called on each request)
CREATE INDEX idx_content_filters_active ON public.content_filters(is_active) WHERE is_active = TRUE;

-- RLS: Only service role can access (loaded by Edge Functions)
ALTER TABLE public.content_filters ENABLE ROW LEVEL SECURITY;

-- No public policies - service role bypasses RLS

-- Seed initial conservative patterns
-- NOTE: These patterns should be reviewed and expanded by security team
INSERT INTO public.content_filters (pattern, category, severity, match_type, description) VALUES
  -- Illegal content (severity 3 - immediate action)
  ('(child|minor|underage|young).{0,20}(nude|naked|sex|porn)', 'illegal_content', 3, 'regex', 'CSAM-related terms'),
  ('(nude|naked|sex|porn).{0,20}(child|minor|underage|young)', 'illegal_content', 3, 'regex', 'CSAM-related terms reverse'),

  -- Extreme violence (severity 2)
  ('(gore|gory|mutilat|dismember|decapitat)', 'extreme_violence', 2, 'regex', 'Extreme violence terms'),
  ('(torture|torturing).{0,10}(detail|graphic|explicit)', 'extreme_violence', 2, 'regex', 'Detailed torture'),

  -- Deceptive content (severity 2)
  ('(real|actual).{0,10}(person|celebrity|politician).{0,10}(nude|naked|sex)', 'deceptive', 2, 'regex', 'Deepfake indicators');

COMMENT ON TABLE public.content_filters IS 'Content moderation patterns for AI image prompt filtering';
COMMENT ON COLUMN public.content_filters.severity IS '1=warning, 2=strike, 3=immediate lockout';
COMMENT ON COLUMN public.content_filters.match_type IS 'How to match: exact, regex, or contains';
