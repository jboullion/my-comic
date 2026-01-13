-- Migration: Create user_credits table
-- Description: Stores each user's current credit balance, tier, and monthly allocation

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Main user_credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  monthly_allocation INTEGER NOT NULL DEFAULT 10,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'hobbyist', 'pro')),
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each user can only have one credits record
  CONSTRAINT unique_user_credits UNIQUE (user_id),
  -- Balance cannot go negative
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- Index for fast user lookups
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);

-- Index for monthly reset queries (find users needing reset)
CREATE INDEX idx_user_credits_last_reset ON public.user_credits(last_reset_at);

-- Trigger to auto-update updated_at
CREATE TRIGGER user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.user_credits IS 'Stores user credit balances for AI features';
COMMENT ON COLUMN public.user_credits.balance IS 'Current credit balance (cannot go negative)';
COMMENT ON COLUMN public.user_credits.monthly_allocation IS 'Credits granted each month based on tier';
COMMENT ON COLUMN public.user_credits.tier IS 'Subscription tier: free (10/mo), hobbyist (100/mo), pro (250/mo)';
COMMENT ON COLUMN public.user_credits.last_reset_at IS 'When credits were last reset (rolling 30-day window)';
