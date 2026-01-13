/**
 * Credits Store
 * Zustand store for managing user credit balance and transactions
 */

import { create } from 'zustand'
import { getCredits, type UserCredits, type CreditTransaction } from '../lib/credits'

interface CreditsState {
  // Credit data
  credits: UserCredits | null
  history: CreditTransaction[]

  // Loading states
  isLoading: boolean
  isLoadingHistory: boolean
  error: string | null

  // Last fetch timestamp (for caching)
  lastFetch: number | null

  // Actions
  fetchCredits: (force?: boolean) => Promise<void>
  fetchHistory: () => Promise<void>
  updateBalance: (newBalance: number) => void
  clearCredits: () => void

  // Computed helpers
  hasCredits: (cost: number) => boolean
  isImageGenRestricted: () => boolean
  getImageGenLockoutMessage: () => string | null
}

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000

export const useCreditsStore = create<CreditsState>((set, get) => ({
  credits: null,
  history: [],
  isLoading: false,
  isLoadingHistory: false,
  error: null,
  lastFetch: null,

  /**
   * Fetch user credits from the server
   * Uses caching to avoid excessive API calls
   */
  fetchCredits: async (force = false) => {
    const state = get()

    // Skip if already loading
    if (state.isLoading) return

    // Use cache if available and not forcing refresh
    if (!force && state.lastFetch && state.credits) {
      const age = Date.now() - state.lastFetch
      if (age < CACHE_DURATION) {
        return
      }
    }

    set({ isLoading: true, error: null })

    try {
      const response = await getCredits(false)
      set({
        credits: response.credits,
        isLoading: false,
        lastFetch: Date.now(),
      })
    } catch (error) {
      console.error('[Credits Store] Failed to fetch credits:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch credits',
      })
    }
  },

  /**
   * Fetch transaction history
   */
  fetchHistory: async () => {
    set({ isLoadingHistory: true })

    try {
      const response = await getCredits(true)
      set({
        credits: response.credits,
        history: response.history || [],
        isLoadingHistory: false,
        lastFetch: Date.now(),
      })
    } catch (error) {
      console.error('[Credits Store] Failed to fetch history:', error)
      set({
        isLoadingHistory: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history',
      })
    }
  },

  /**
   * Update balance after a successful AI operation
   * Called by AI functions after credits are deducted
   */
  updateBalance: (newBalance: number) => {
    const state = get()
    if (state.credits) {
      set({
        credits: {
          ...state.credits,
          balance: newBalance,
        },
      })
    }
  },

  /**
   * Clear credits (on logout)
   */
  clearCredits: () => {
    set({
      credits: null,
      history: [],
      isLoading: false,
      isLoadingHistory: false,
      error: null,
      lastFetch: null,
    })
  },

  /**
   * Check if user has enough credits for an action
   */
  hasCredits: (cost: number) => {
    const state = get()
    if (!state.credits) return false
    return state.credits.balance >= cost
  },

  /**
   * Check if user is restricted from image generation
   */
  isImageGenRestricted: () => {
    const state = get()
    if (!state.credits) return false
    if (state.credits.imageGenStatus !== 'restricted') return false

    // Check if lockout has expired
    if (state.credits.imageGenLockedUntil) {
      const lockoutExpiry = new Date(state.credits.imageGenLockedUntil)
      if (lockoutExpiry < new Date()) {
        return false // Lockout expired
      }
    }
    return true
  },

  /**
   * Get a user-friendly lockout message
   */
  getImageGenLockoutMessage: () => {
    const state = get()
    if (!state.credits) return null
    if (state.credits.imageGenStatus !== 'restricted') return null

    if (state.credits.imageGenLockedUntil) {
      const lockoutExpiry = new Date(state.credits.imageGenLockedUntil)
      if (lockoutExpiry < new Date()) {
        return null // Lockout expired
      }
      return `Image generation is temporarily unavailable until ${lockoutExpiry.toLocaleString()}`
    }

    return 'Image generation is temporarily unavailable for your account.'
  },
}))

/**
 * Hook to get credit balance
 * Returns null if not loaded yet
 */
export function useCreditBalance(): number | null {
  return useCreditsStore((state) => state.credits?.balance ?? null)
}

/**
 * Hook to check if user has enough credits
 */
export function useHasCredits(cost: number): boolean {
  return useCreditsStore((state) => state.hasCredits(cost))
}

/**
 * Hook to get tier info
 */
export function useTier(): string | null {
  return useCreditsStore((state) => state.credits?.tier ?? null)
}

/**
 * Hook to check if image generation is restricted
 */
export function useIsImageGenRestricted(): boolean {
  return useCreditsStore((state) => state.isImageGenRestricted())
}

/**
 * Hook to get image generation lockout message
 */
export function useImageGenLockoutMessage(): string | null {
  return useCreditsStore((state) => state.getImageGenLockoutMessage())
}
