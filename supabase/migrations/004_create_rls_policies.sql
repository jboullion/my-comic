-- Migration: Create Row Level Security (RLS) policies
-- Description: Security policies to control data access

-- Enable RLS on all tables
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_costs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- user_credits policies
-- ============================================

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (Edge Functions use service role)
-- No policies needed for service role as it bypasses RLS

-- ============================================
-- credit_transactions policies
-- ============================================

-- Users can view their own transaction history
CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (via Edge Functions)
-- No policies needed for service role as it bypasses RLS

-- ============================================
-- ai_model_costs policies
-- ============================================

-- Model costs are public (anyone can read)
CREATE POLICY "Model costs are public"
  ON public.ai_model_costs
  FOR SELECT
  USING (true);

-- Only service role can modify model costs
-- No policies needed for service role as it bypasses RLS

-- ============================================
-- Comments
-- ============================================

COMMENT ON POLICY "Users can view own credits" ON public.user_credits
  IS 'Users can only see their own credit balance';

COMMENT ON POLICY "Users can view own transactions" ON public.credit_transactions
  IS 'Users can only see their own transaction history';

COMMENT ON POLICY "Model costs are public" ON public.ai_model_costs
  IS 'Anyone can read model costs for UI display';
