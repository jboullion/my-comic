/**
 * Get Credits Edge Function
 * Returns user's current credit balance and tier information
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { createAdminClient } from '../_shared/credits.ts'

interface GetCreditsRequest {
  includeHistory?: boolean
  historyLimit?: number
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Verify authentication
    const { userId, error: authError } = await verifyAuth(req)
    if (!userId) {
      return errorResponse(authError || 'Unauthorized', 401, 'UNAUTHORIZED')
    }

    // Parse request body (optional)
    let body: GetCreditsRequest = {}
    try {
      body = await req.json()
    } catch {
      // No body or invalid JSON is OK for GET-style requests
    }

    const { includeHistory = false, historyLimit = 20 } = body

    // Create admin client
    const adminClient = createAdminClient()

    // Get user credits (including image generation moderation status)
    const { data: credits, error: creditsError } = await adminClient
      .from('user_credits')
      .select('balance, monthly_allocation, tier, last_reset_at, created_at, image_gen_status, image_gen_locked_until')
      .eq('user_id', userId)
      .single()

    if (creditsError || !credits) {
      console.error('[get-credits] Failed to fetch credits:', creditsError)
      return errorResponse('Credits not found', 404, 'NOT_FOUND')
    }

    // Calculate days until reset
    const lastReset = new Date(credits.last_reset_at)
    const nextReset = new Date(lastReset)
    nextReset.setDate(nextReset.getDate() + 30)
    const daysUntilReset = Math.max(0, Math.ceil((nextReset.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

    // Check if image gen lockout has expired
    let imageGenStatus = credits.image_gen_status || 'active'
    let imageGenLockedUntil = credits.image_gen_locked_until
    if (imageGenStatus === 'restricted' && imageGenLockedUntil) {
      const lockoutExpiry = new Date(imageGenLockedUntil)
      if (lockoutExpiry < new Date()) {
        // Lockout expired - status will be auto-updated on next generation attempt
        imageGenStatus = 'warned'
        imageGenLockedUntil = null
      }
    }

    const response: Record<string, unknown> = {
      success: true,
      credits: {
        balance: credits.balance,
        monthlyAllocation: credits.monthly_allocation,
        tier: credits.tier,
        lastResetAt: credits.last_reset_at,
        nextResetAt: nextReset.toISOString(),
        daysUntilReset,
        memberSince: credits.created_at,
        // Image generation moderation status
        imageGenStatus,
        imageGenLockedUntil,
      },
    }

    // Optionally include transaction history
    if (includeHistory) {
      const { data: transactions, error: historyError } = await adminClient
        .from('credit_transactions')
        .select('id, amount, balance_after, transaction_type, description, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(historyLimit)

      if (!historyError && transactions) {
        response.history = transactions
      }
    }

    return jsonResponse(response)
  } catch (error) {
    console.error('[get-credits] Unexpected error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unexpected error',
      500,
      'UNEXPECTED_ERROR'
    )
  }
})
