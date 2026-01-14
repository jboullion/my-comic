/**
 * Delete Account Edge Function
 * Permanently deletes a user's account and all associated data
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { createAdminClient } from '../_shared/credits.ts'

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
  }

  try {
    // Verify authentication - get the user's ID from their JWT
    const { userId, error: authError } = await verifyAuth(req)
    if (!userId) {
      return errorResponse(authError || 'Unauthorized', 401, 'UNAUTHORIZED')
    }

    console.log(`[delete-account] User ${userId} requested account deletion`)

    // Create admin client to bypass RLS and delete the user
    const adminClient = createAdminClient()

    // Delete the user from Supabase Auth
    // This will cascade delete all related data in:
    // - user_credits (ON DELETE CASCADE)
    // - credit_transactions (ON DELETE CASCADE)
    // - user_violations (ON DELETE CASCADE)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error(`[delete-account] Failed to delete user ${userId}:`, deleteError)
      return errorResponse(
        'Failed to delete account. Please try again or contact support.',
        500,
        'DELETE_FAILED'
      )
    }

    console.log(`[delete-account] Successfully deleted user ${userId}`)

    return jsonResponse({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('[delete-account] Unexpected error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unexpected error',
      500,
      'UNEXPECTED_ERROR'
    )
  }
})
