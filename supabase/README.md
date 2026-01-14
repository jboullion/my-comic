# Supabase Token/Credit System Setup

This directory contains the database migrations and Edge Functions for the Comic Book Maker's AI credit system.

## Overview

The token system tracks AI usage credits:
- **Free tier**: 10 credits/month
- **Hobbyist tier**: 100 credits/month ($10/mo)
- **Pro tier**: 250 credits/month (future)

**Credits roll over** - unused credits carry over to the next month. Users never lose credits they don't spend.

### Token Costs

| Provider | Model | Credits |
|----------|-------|---------|
| Fal.ai | FLUX 2 Pro | 8 |
| Fal.ai | FLUX 2 Dev | 5 |
| Fal.ai | Nano Banana | 2 |
| OpenRouter | Gemini Flash | 1 |
| OpenRouter | Claude/GPT Premium | 2 |
| OpenRouter | Prompt Enhancement | 1 |

## Setup Instructions

### 1. Run Database Migrations

Run the SQL migration files in order via the Supabase SQL Editor:

```bash
# Navigate to migrations directory
cd supabase/migrations

# Run each file in order
001_create_user_credits.sql
002_create_credit_transactions.sql
003_create_ai_model_costs.sql
004_create_rls_policies.sql
005_create_user_credits_trigger.sql
006_create_monthly_reset.sql
```

**Alternative: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### 2. Set Up Edge Function Secrets

Add the following secrets in your Supabase dashboard (Project Settings > Edge Functions > Secrets):

```
FAL_AI_KEY=your-fal-ai-api-key
OPENROUTER_KEY=your-openrouter-api-key
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy generate-image
supabase functions deploy story-chat
supabase functions deploy enhance-prompt
supabase functions deploy get-credits
```

### 4. Grant Credits to Existing Users

Run this SQL to give existing users their initial credits:

```sql
-- Create credits for existing users who don't have them
INSERT INTO public.user_credits (user_id, balance, monthly_allocation, tier)
SELECT id, 10, 10, 'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;
```

### 5. Set Up Monthly Reset Cron (Optional)

Using pg_cron (available in Supabase):

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily reset check at midnight UTC
SELECT cron.schedule(
  'monthly-credit-reset',
  '0 0 * * *',
  $$SELECT public.reset_monthly_credits()$$
);
```

## File Structure

```
supabase/
├── migrations/
│   ├── 001_create_user_credits.sql       # User balance table
│   ├── 002_create_credit_transactions.sql # Transaction history
│   ├── 003_create_ai_model_costs.sql     # Model cost config
│   ├── 004_create_rls_policies.sql       # Row Level Security
│   ├── 005_create_user_credits_trigger.sql # Auto-create on signup
│   └── 006_create_monthly_reset.sql      # Reset & deduct functions
└── functions/
    ├── _shared/
    │   ├── auth.ts                       # JWT verification
    │   ├── cors.ts                       # CORS headers
    │   └── credits.ts                    # Credit operations
    ├── generate-image/                   # Fal.ai proxy
    ├── story-chat/                       # OpenRouter proxy
    ├── enhance-prompt/                   # Prompt enhancement
    └── get-credits/                      # Get user balance
```

## Frontend Integration

### Using Edge Functions

```typescript
import {
  generateImageViaEdge,
  storyChatViaEdge,
  getModelCost,
} from '@/lib/ai/edgeFunctions'

// Generate image with credit check
const result = await generateImageViaEdge({
  prompt: 'A superhero flying',
  model: 'flux-2',
  style: 'comic',
})

// Credits are automatically updated in the store
console.log(result.credits.newBalance)
```

### Credits Hook

```typescript
import { useCredits } from '@/hooks/useCredits'

function MyComponent() {
  const { balance, tier, hasCredits, refresh } = useCredits()

  if (!hasCredits(5)) {
    return <InsufficientCreditsModal />
  }

  // ...
}
```

### UI Components

```typescript
import {
  CreditBalance,
  CreditCostPreview,
  InsufficientCreditsModal,
  CreditHistoryModal,
} from '@/components/credits'

// Show balance in header
<CreditBalance variant="compact" onClick={openHistory} />

// Show cost before action
<CreditCostPreview cost={5} actionLabel="Image generation" />
```

## Manual Credit Operations

### Add credits to a user (admin)

```sql
SELECT public.add_credits(
  'USER_UUID_HERE',
  50,
  'manual_grant',
  'Support credit grant'
);
```

### Check user balance

```sql
SELECT * FROM public.user_credits WHERE user_id = 'USER_UUID_HERE';
```

### View transaction history

```sql
SELECT * FROM public.credit_transactions
WHERE user_id = 'USER_UUID_HERE'
ORDER BY created_at DESC
LIMIT 20;
```

## Troubleshooting

### "User credits not found" error
- Check that the signup trigger is working
- Run the "Grant Credits to Existing Users" SQL

### Edge Function errors
- Verify secrets are set correctly
- Check function logs in Supabase dashboard
- Ensure CORS is configured for your domain

### Credits not deducting
- Check Edge Function is being called (not direct API)
- Verify user is authenticated
- Check Supabase function logs for errors
