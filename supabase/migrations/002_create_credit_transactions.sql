-- Migration: Create credit_transactions table
-- Description: Audit log of all credit changes (usage, grants, refunds)

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount: negative for usage, positive for grants
  amount INTEGER NOT NULL,

  -- Balance after this transaction (for audit trail)
  balance_after INTEGER NOT NULL,

  -- Type of transaction
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'monthly_grant',     -- Automatic monthly reset
    'manual_grant',      -- Admin manual addition
    'purchase',          -- User purchased credits (future)
    'ai_image',          -- Image generation usage
    'ai_story',          -- Story AI chat usage
    'ai_enhance',        -- Prompt enhancement usage
    'refund',            -- Refund for failed generation
    'adjustment'         -- Manual adjustment by admin
  )),

  -- Human-readable description
  description TEXT,

  -- Additional metadata (model used, prompt hash, etc.)
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying user's transaction history
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- Index for sorting by date (most recent first)
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Index for filtering by transaction type
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(transaction_type);

-- Composite index for user + date queries
CREATE INDEX idx_credit_transactions_user_date ON public.credit_transactions(user_id, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.credit_transactions IS 'Audit log of all credit changes';
COMMENT ON COLUMN public.credit_transactions.amount IS 'Credit change: negative for usage, positive for grants';
COMMENT ON COLUMN public.credit_transactions.balance_after IS 'User balance after this transaction';
COMMENT ON COLUMN public.credit_transactions.metadata IS 'JSON with model, provider, request_id, etc.';
