-- Unlock a specific user by email
UPDATE public.user_credits uc
SET 
  image_gen_status = 'active',
  image_gen_locked_until = NULL,
  image_gen_violations_24h = 0
FROM auth.users u
WHERE uc.user_id = u.id 
  AND u.email = 'jboullion83@gmail.com';

-- Or unlock by user_id directly
UPDATE public.user_credits
SET 
  image_gen_status = 'active',
  image_gen_locked_until = NULL,
  image_gen_violations_24h = 0
WHERE user_id = 'your-user-id-here';  -- Replace with the actual user_id
