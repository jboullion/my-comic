/**
 * Edge Functions AI Client
 * Calls Supabase Edge Functions for AI operations with credit tracking
 */

import { supabase } from '../supabase'
import { useCreditsStore } from '../../stores/useCreditsStore'

// Edge Function URL
const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : '/functions/v1'

/**
 * Get auth token for Edge Function calls
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken()
  return !!token
}

// ============================================
// Image Generation via Edge Function
// ============================================

export interface GenerateImageOptions {
  prompt: string
  style?: string
  model?: string
  imageSize?: string | { width: number; height: number }
  seed?: number | null
  allowMature?: boolean
  lora?: {
    url: string
    scale?: number
    triggerWord?: string
  } | null
  customModel?: {
    url: string
    type: string
    name: string
  } | null
  guidanceScale?: number | null
  inferenceSteps?: number | null
  negativePrompt?: string | null
  onProgress?: (progress: { status: string; position?: number }) => void
}

export interface GenerateImageResult {
  imageUrl: string
  width: number
  height: number
  seed: number
  prompt: string
  fullPrompt: string
  model: string
  customModelName: string | null
  usedLora: boolean
  usedCustomModel: boolean
  credits: {
    cost: number
    newBalance: number
  }
}

/**
 * Generate an image via Edge Function
 * Handles credit checking and deduction server-side
 */
export async function generateImageViaEdge(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const token = await getAuthToken()

  if (!token) {
    throw new Error('Please sign in to use AI image generation')
  }

  const { onProgress, ...requestBody } = options

  // Notify that we're starting
  if (onProgress) {
    onProgress({ status: 'IN_QUEUE' })
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}/generate-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.error?.message || `Request failed: ${response.status}`
    const errorCode = data.error?.code

    // Provide user-friendly error messages
    if (errorCode === 'INSUFFICIENT_CREDITS') {
      throw new Error('You don\'t have enough credits. Please upgrade your plan or wait for your monthly reset.')
    }
    if (errorCode === 'UNAUTHORIZED') {
      throw new Error('Please sign in to use AI image generation')
    }

    throw new Error(errorMessage)
  }

  // Update the credits store with new balance
  if (data.credits?.newBalance !== undefined) {
    useCreditsStore.getState().updateBalance(data.credits.newBalance)
  }

  // Notify completion
  if (onProgress) {
    onProgress({ status: 'COMPLETED' })
  }

  return data as GenerateImageResult
}

// ============================================
// Story Chat via Edge Function
// ============================================

export interface StoryChatOptions {
  message: string
  model?: string
  provider?: string
  imageUrl?: string | null
  chatHistory?: Array<{ role: string; content: string }>
  projectContext?: {
    title?: string
    pageNumber?: number
    totalPages?: number
    characters?: Array<{ name: string; description?: string }>
    customStoryPrompt?: string
  }
}

export interface StoryChatResult {
  response: string
  model: string
  provider: string
  credits: {
    cost: number
    newBalance: number
  }
}

/**
 * Chat with Story AI via Edge Function
 */
export async function storyChatViaEdge(options: StoryChatOptions): Promise<StoryChatResult> {
  const token = await getAuthToken()

  if (!token) {
    throw new Error('Please sign in to use Story AI')
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}/story-chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.error?.message || `Request failed: ${response.status}`
    const errorCode = data.error?.code

    if (errorCode === 'INSUFFICIENT_CREDITS') {
      throw new Error('You don\'t have enough credits. Please upgrade your plan or wait for your monthly reset.')
    }
    if (errorCode === 'UNAUTHORIZED') {
      throw new Error('Please sign in to use Story AI')
    }

    throw new Error(errorMessage)
  }

  // Update credits store
  if (data.credits?.newBalance !== undefined) {
    useCreditsStore.getState().updateBalance(data.credits.newBalance)
  }

  return data as StoryChatResult
}

// ============================================
// Prompt Enhancement via Edge Function
// ============================================

export interface EnhancePromptOptions {
  prompt: string
  characters?: Array<{ name: string; description?: string }>
}

export interface EnhancePromptResult {
  enhancedPrompt: string
  credits: {
    cost: number
    newBalance: number
  }
}

/**
 * Enhance an image prompt via Edge Function
 */
export async function enhancePromptViaEdge(options: EnhancePromptOptions): Promise<EnhancePromptResult> {
  const token = await getAuthToken()

  if (!token) {
    throw new Error('Please sign in to use prompt enhancement')
  }

  const response = await fetch(`${EDGE_FUNCTION_URL}/enhance-prompt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data.error?.message || `Request failed: ${response.status}`
    const errorCode = data.error?.code

    if (errorCode === 'INSUFFICIENT_CREDITS') {
      throw new Error('You don\'t have enough credits for prompt enhancement')
    }

    throw new Error(errorMessage)
  }

  // Update credits store
  if (data.credits?.newBalance !== undefined) {
    useCreditsStore.getState().updateBalance(data.credits.newBalance)
  }

  return data as EnhancePromptResult
}

// ============================================
// Model Cost Lookup (for UI preview)
// ============================================

// Model costs (must match database seed values)
export const MODEL_COSTS = {
  // Fal.ai Image Models
  'flux-2-pro': 8,
  'flux-2': 5,
  'nano-banana': 2,
  'custom': 5,

  // OpenRouter Story Models
  'gemini-2.5-flash': 1,
  'gemini-3-flash': 1,
  'gemini-2.5-pro': 2,
  'claude-sonnet-4.5': 2,
  'claude-haiku-4.5': 1,
  'claude-3-haiku': 1,
  'gpt-5-mini': 1,
  'gpt-5-nano': 1,
  'gpt-4o': 2,
  'llama-3.2-90b-vision': 1,
  'seed-1.6-flash': 1,
  'seed-1.6': 1,
  'enhance-prompt': 1,
} as const

/**
 * Get the credit cost for a model
 */
export function getModelCost(modelKey: string): number {
  return MODEL_COSTS[modelKey as keyof typeof MODEL_COSTS] ?? 5
}

/**
 * Get the credit cost for image generation
 */
export function getImageGenerationCost(modelKey: string): number {
  return getModelCost(modelKey)
}

/**
 * Get the credit cost for story chat
 */
export function getStoryChatCost(modelKey: string): number {
  return getModelCost(modelKey)
}
