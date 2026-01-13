-- Migration: Create ai_model_costs table
-- Description: Configuration table for token costs per AI model

CREATE TABLE public.ai_model_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider: 'fal' for image generation, 'openrouter' for story AI
  provider TEXT NOT NULL,

  -- Model identifier (must match what's used in code)
  model_key TEXT NOT NULL,

  -- Display name for UI
  display_name TEXT,

  -- Token cost per request
  cost_tokens INTEGER NOT NULL,

  -- Whether this model is currently available
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each provider+model combination must be unique
  CONSTRAINT unique_model UNIQUE (provider, model_key)
);

-- Trigger to auto-update updated_at
CREATE TRIGGER ai_model_costs_updated_at
  BEFORE UPDATE ON public.ai_model_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for looking up costs
CREATE INDEX idx_ai_model_costs_lookup ON public.ai_model_costs(provider, model_key) WHERE is_active = TRUE;

-- Seed initial model costs
-- Fal.ai Image Models
INSERT INTO public.ai_model_costs (provider, model_key, display_name, cost_tokens) VALUES
  ('fal', 'flux-2-pro', 'FLUX 2 Pro', 8),
  ('fal', 'flux-2', 'FLUX 2 Dev', 5),
  ('fal', 'nano-banana', 'Nano Banana Pro', 2),
  ('fal', 'custom', 'Custom Model', 5);

-- OpenRouter Story AI Models
INSERT INTO public.ai_model_costs (provider, model_key, display_name, cost_tokens) VALUES
  ('openrouter', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 1),
  ('openrouter', 'gemini-3-flash', 'Gemini 3 Flash', 1),
  ('openrouter', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 2),
  ('openrouter', 'claude-sonnet-4.5', 'Claude Sonnet 4.5', 2),
  ('openrouter', 'claude-haiku-4.5', 'Claude Haiku 4.5', 1),
  ('openrouter', 'claude-3-haiku', 'Claude 3 Haiku', 1),
  ('openrouter', 'gpt-5-mini', 'GPT-5 Mini', 1),
  ('openrouter', 'gpt-5-nano', 'GPT-5 Nano', 1),
  ('openrouter', 'gpt-4o', 'GPT-4o', 2),
  ('openrouter', 'llama-3.2-90b-vision', 'Llama 3.2 90B Vision', 1),
  ('openrouter', 'seed-1.6-flash', 'Seed 1.6 Flash', 1),
  ('openrouter', 'seed-1.6', 'Seed 1.6', 1),
  ('openrouter', 'enhance-prompt', 'Prompt Enhancement', 1);

-- Add comments for documentation
COMMENT ON TABLE public.ai_model_costs IS 'Configuration table for AI model token costs';
COMMENT ON COLUMN public.ai_model_costs.provider IS 'AI provider: fal (images) or openrouter (text)';
COMMENT ON COLUMN public.ai_model_costs.model_key IS 'Model identifier matching code constants';
COMMENT ON COLUMN public.ai_model_costs.cost_tokens IS 'Credits deducted per request';
