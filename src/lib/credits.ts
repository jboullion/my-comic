/**
 * Credits API Client
 * Handles all credit-related API calls to Supabase Edge Functions
 */

import { supabase } from './supabase'

// Use environment variable for Edge Function URL, fallback to relative path
const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : '/functions/v1'

export interface UserCredits {
  balance: number
  monthlyAllocation: number
  tier: 'free' | 'hobbyist' | 'pro'
  lastResetAt: string
  nextResetAt: string
  daysUntilReset: number
  memberSince: string
}

export interface CreditTransaction {
  id: string
  amount: number
  balanceAfter: number
  transactionType: string
  description: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface CreditsResponse {
  success: boolean
  credits: UserCredits
  history?: CreditTransaction[]
}

export interface CreditsError {
  error: {
    message: string
    code?: string
  }
}

/**
 * Get the current user's auth token
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/**
 * Make an authenticated request to an Edge Function
 */
async function callEdgeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<T> {
  const token = await getAuthToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    const error = data as CreditsError
    throw new Error(error.error?.message || `Request failed: ${response.status}`)
  }

  return data as T
}

/**
 * Fetch the current user's credits and tier information
 */
export async function getCredits(includeHistory = false): Promise<CreditsResponse> {
  return callEdgeFunction<CreditsResponse>('get-credits', {
    includeHistory,
    historyLimit: 20,
  })
}

/**
 * Fetch only transaction history
 */
export async function getCreditHistory(limit = 50): Promise<CreditTransaction[]> {
  const response = await callEdgeFunction<CreditsResponse>('get-credits', {
    includeHistory: true,
    historyLimit: limit,
  })
  return response.history || []
}

/**
 * Check if user has enough credits for an action
 */
export function hasEnoughCredits(balance: number, cost: number): boolean {
  return balance >= cost
}

/**
 * Format credit amount for display
 */
export function formatCredits(amount: number): string {
  if (amount === 1) return '1 credit'
  return `${amount} credits`
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  switch (tier) {
    case 'free':
      return 'Free'
    case 'hobbyist':
      return 'Hobbyist'
    case 'pro':
      return 'Pro'
    default:
      return tier
  }
}

/**
 * Get tier color class for styling
 */
export function getTierColorClass(tier: string): string {
  switch (tier) {
    case 'free':
      return 'text-slate-400'
    case 'hobbyist':
      return 'text-indigo-400'
    case 'pro':
      return 'text-amber-400'
    default:
      return 'text-slate-400'
  }
}
