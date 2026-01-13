/**
 * useCredits Hook
 * React hook for accessing and managing user credits
 */

import { useEffect } from 'react'
import { useCreditsStore, useCreditBalance, useHasCredits, useTier } from '../stores/useCreditsStore'
import { useAuth } from '../contexts/AuthContext'

interface UseCreditsReturn {
  // Credit data
  balance: number | null
  tier: string | null
  credits: ReturnType<typeof useCreditsStore>['credits']
  history: ReturnType<typeof useCreditsStore>['history']

  // Loading states
  isLoading: boolean
  isLoadingHistory: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
  fetchHistory: () => Promise<void>

  // Helpers
  hasCredits: (cost: number) => boolean
  isLoggedIn: boolean
}

/**
 * Main hook for accessing credits throughout the app
 * Automatically fetches credits when user is authenticated
 */
export function useCredits(): UseCreditsReturn {
  const { user } = useAuth()
  const store = useCreditsStore()
  const balance = useCreditBalance()
  const tier = useTier()

  // Fetch credits when user logs in
  useEffect(() => {
    if (user) {
      store.fetchCredits()
    } else {
      store.clearCredits()
    }
  }, [user?.id])

  return {
    balance,
    tier,
    credits: store.credits,
    history: store.history,
    isLoading: store.isLoading,
    isLoadingHistory: store.isLoadingHistory,
    error: store.error,
    refresh: () => store.fetchCredits(true),
    fetchHistory: store.fetchHistory,
    hasCredits: store.hasCredits,
    isLoggedIn: !!user,
  }
}

/**
 * Simple hook for checking if user can afford an action
 */
export function useCanAfford(cost: number): boolean {
  const { user } = useAuth()
  const hasEnough = useHasCredits(cost)

  // If not logged in, assume they can't afford it
  if (!user) return false

  return hasEnough
}

/**
 * Hook for displaying credit cost preview
 */
export function useCreditCost(cost: number): {
  cost: number
  canAfford: boolean
  balance: number | null
  remainingAfter: number | null
} {
  const balance = useCreditBalance()
  const canAfford = balance !== null && balance >= cost

  return {
    cost,
    canAfford,
    balance,
    remainingAfter: balance !== null ? Math.max(0, balance - cost) : null,
  }
}
