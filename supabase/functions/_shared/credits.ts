/**
 * Credit management utilities for Edge Functions
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreditCheckResult {
  success: boolean
  balance?: number
  cost?: number
  error?: string
  errorCode?: 'INSUFFICIENT_CREDITS' | 'USER_NOT_FOUND' | 'MODEL_NOT_FOUND' | 'DB_ERROR'
}

interface DeductResult {
  success: boolean
  newBalance?: number
  transactionId?: string
  error?: string
}

/**
 * Create a Supabase admin client (bypasses RLS)
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get the model cost from the database
 */
export async function getModelCost(
  adminClient: SupabaseClient,
  provider: string,
  modelKey: string
): Promise<number | null> {
  const { data, error } = await adminClient
    .from('ai_model_costs')
    .select('cost_tokens')
    .eq('provider', provider)
    .eq('model_key', modelKey)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.error('[Credits] Model cost lookup failed:', error)
    return null
  }

  return data.cost_tokens
}

/**
 * Check if user has sufficient credits for a request
 */
export async function checkCredits(
  adminClient: SupabaseClient,
  userId: string,
  provider: string,
  modelKey: string
): Promise<CreditCheckResult> {
  // Get model cost
  const cost = await getModelCost(adminClient, provider, modelKey)
  if (cost === null) {
    return {
      success: false,
      error: `Unknown model: ${provider}/${modelKey}`,
      errorCode: 'MODEL_NOT_FOUND',
    }
  }

  // Get user's current balance
  const { data: credits, error } = await adminClient
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (error || !credits) {
    console.error('[Credits] User credits lookup failed:', error)
    return {
      success: false,
      error: 'User credits not found',
      errorCode: 'USER_NOT_FOUND',
    }
  }

  if (credits.balance < cost) {
    return {
      success: false,
      balance: credits.balance,
      cost,
      error: `Insufficient credits. Need ${cost}, have ${credits.balance}`,
      errorCode: 'INSUFFICIENT_CREDITS',
    }
  }

  return {
    success: true,
    balance: credits.balance,
    cost,
  }
}

/**
 * Deduct credits from user's balance
 * Uses the database function for atomic operations
 */
export async function deductCredits(
  adminClient: SupabaseClient,
  userId: string,
  amount: number,
  transactionType: string,
  description?: string,
  metadata: Record<string, unknown> = {}
): Promise<DeductResult> {
  const { data, error } = await adminClient.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_description: description || null,
    p_metadata: metadata,
  })

  if (error) {
    console.error('[Credits] Deduct failed:', error)
    return {
      success: false,
      error: 'Failed to deduct credits',
    }
  }

  // Check return value from function
  if (data === -1) {
    return {
      success: false,
      error: 'Insufficient credits',
    }
  }

  if (data === -2) {
    return {
      success: false,
      error: 'User not found',
    }
  }

  return {
    success: true,
    newBalance: data as number,
  }
}

/**
 * Add credits back (refund on failure)
 */
export async function refundCredits(
  adminClient: SupabaseClient,
  userId: string,
  amount: number,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<DeductResult> {
  const { data, error } = await adminClient.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: 'refund',
    p_description: reason,
    p_metadata: metadata,
  })

  if (error) {
    console.error('[Credits] Refund failed:', error)
    return {
      success: false,
      error: 'Failed to refund credits',
    }
  }

  return {
    success: true,
    newBalance: data as number,
  }
}

/**
 * Get user's current credit balance
 */
export async function getBalance(
  adminClient: SupabaseClient,
  userId: string
): Promise<number | null> {
  const { data, error } = await adminClient
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.balance
}
