-- Migration: Create trigger to auto-create user_credits on signup
-- Description: When a new user signs up, automatically create their credits record

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_credits INTEGER := 10;
BEGIN
  -- Create user_credits record with free tier defaults
  INSERT INTO public.user_credits (
    user_id,
    balance,
    monthly_allocation,
    tier
  )
  VALUES (
    NEW.id,
    initial_credits,
    initial_credits,
    'free'
  );

  -- Log the initial welcome grant
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    description,
    metadata
  )
  VALUES (
    NEW.id,
    initial_credits,
    initial_credits,
    'monthly_grant',
    'Welcome credits - Free tier',
    jsonb_build_object('event', 'signup', 'tier', 'free')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user()
  IS 'Automatically creates user_credits record when new user signs up';
