/**
 * Authentication utilities for Edge Functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AuthResult {
  userId: string | null
  error?: string
}

/**
 * Verify the JWT token from the Authorization header
 * Returns the user ID if valid, null if invalid
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  // Create client with the user's token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    console.error('[Auth] Token verification failed:', error)
    return { userId: null, error: 'Invalid or expired token' }
  }

  return { userId: user.id }
}
