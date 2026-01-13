-- Migration: Create monthly credit reset function
-- Description: Function to reset credits for users whose 30-day period has elapsed

-- Function to reset monthly credits
-- Returns the number of users whose credits were reset
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  -- Find users whose last reset was more than 30 days ago and reset them
  WITH reset_users AS (
    UPDATE public.user_credits
    SET
      balance = monthly_allocation,
      last_reset_at = NOW()
    WHERE last_reset_at < NOW() - INTERVAL '30 days'
    RETURNING user_id, monthly_allocation
  ),
  -- Log the reset transactions
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
      ru.monthly_allocation,
      'monthly_grant',
      'Monthly credit reset',
      jsonb_build_object('event', 'monthly_reset', 'allocation', ru.monthly_allocation)
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
  IS 'Resets credits for users whose 30-day period has elapsed. Call daily via cron.';

COMMENT ON FUNCTION public.deduct_credits(UUID, INTEGER, TEXT, TEXT, JSONB)
  IS 'Atomically deducts credits if sufficient balance. Returns new balance or error code.';

COMMENT ON FUNCTION public.add_credits(UUID, INTEGER, TEXT, TEXT, JSONB)
  IS 'Adds credits to user balance. Used for purchases, refunds, and manual grants.';
