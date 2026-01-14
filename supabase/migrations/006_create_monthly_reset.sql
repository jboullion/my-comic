-- Migration: Create monthly credit allocation functions
-- Description: Function to add monthly credits to users (with rollover - unused credits preserved)

-- Function to add monthly credits (with rollover)
-- Returns the number of users who received their monthly allocation
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  -- Find users whose last reset was more than 30 days ago and ADD their monthly allocation
  -- (Credits roll over - unused credits are preserved)
  WITH reset_users AS (
    UPDATE public.user_credits
    SET
      balance = balance + monthly_allocation,  -- ADD to existing balance (rollover)
      last_reset_at = NOW()
    WHERE last_reset_at < NOW() - INTERVAL '30 days'
    RETURNING user_id, monthly_allocation, balance
  ),
  -- Log the monthly grant transactions
  logged_resets AS (
    INSERT INTO public.credit_transactions (
      user_id,
      amount,
      balance_after,
      transaction_type,
      description,
      metadata
    )
    SELECT
      ru.user_id,
      ru.monthly_allocation,
      ru.balance,  -- New balance after rollover
      'monthly_grant',
      'Monthly credit allocation (rollover)',
      jsonb_build_object('event', 'monthly_allocation', 'allocation', ru.monthly_allocation)
    FROM reset_users ru
    RETURNING user_id
  )
  SELECT COUNT(*) INTO reset_count FROM logged_resets;

  RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and deduct credits atomically
-- Returns: new_balance on success, -1 if insufficient credits, -2 if user not found
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Lock the user's credits row and get current balance
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- User not found
  IF NOT FOUND THEN
    RETURN -2;
  END IF;

  -- Insufficient credits
  IF current_balance < p_amount THEN
    RETURN -1;
  END IF;

  -- Calculate new balance
  new_balance := current_balance - p_amount;

  -- Update balance
  UPDATE public.user_credits
  SET balance = new_balance
  WHERE user_id = p_user_id;

  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    -p_amount,  -- Negative for deduction
    new_balance,
    p_transaction_type,
    p_description,
    p_metadata
  );

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for purchases, refunds, manual grants)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Update balance and get new value
  UPDATE public.user_credits
  SET balance = balance + p_amount
  WHERE user_id = p_user_id
  RETURNING balance INTO new_balance;

  -- User not found
  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    p_amount,  -- Positive for addition
    new_balance,
    p_transaction_type,
    p_description,
    p_metadata
  );

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION public.reset_monthly_credits()
  IS 'Adds monthly credit allocation to users whose 30-day period has elapsed. Credits roll over (unused credits preserved). Call daily via cron.';

COMMENT ON FUNCTION public.deduct_credits(UUID, INTEGER, TEXT, TEXT, JSONB)
  IS 'Atomically deducts credits if sufficient balance. Returns new balance or error code.';

COMMENT ON FUNCTION public.add_credits(UUID, INTEGER, TEXT, TEXT, JSONB)
  IS 'Adds credits to user balance. Used for purchases, refunds, and manual grants.';
