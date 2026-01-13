/**
 * Content Moderation utilities for Edge Functions
 * Handles pre-filtering prompts and tracking violations for image generation
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SHA-256 hash for prompt (don't store actual content)
async function hashPrompt(prompt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(prompt.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

interface ContentFilter {
  id: string
  pattern: string
  category: string
  severity: number
  match_type: 'exact' | 'regex' | 'contains'
}

interface ImageGenStatus {
  canGenerate: boolean
  status: string
  lockedUntil: string | null
  message: string | null
}

interface FilterResult {
  passed: boolean
  matchedFilter?: ContentFilter
  category?: string
  severity?: number
}

interface ViolationResult {
  violationId: string
  newStatus: string
  lockedUntil: string | null
  actionTaken: string
}

// Cache for content filters (reload every 5 minutes)
let filterCache: ContentFilter[] | null = null
let filterCacheTime = 0
const FILTER_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Load content filters from database (with caching)
 */
export async function loadContentFilters(
  adminClient: SupabaseClient
): Promise<ContentFilter[]> {
  const now = Date.now()

  if (filterCache && (now - filterCacheTime) < FILTER_CACHE_TTL) {
    return filterCache
  }

  const { data, error } = await adminClient
    .from('content_filters')
    .select('id, pattern, category, severity, match_type')
    .eq('is_active', true)

  if (error) {
    console.error('[Moderation] Failed to load filters:', error)
    // Return cached filters if available, otherwise empty array
    return filterCache || []
  }

  filterCache = data as ContentFilter[]
  filterCacheTime = now

  console.log(`[Moderation] Loaded ${filterCache.length} content filters`)
  return filterCache
}

/**
 * Check prompt against content filters
 */
export async function checkPromptContent(
  adminClient: SupabaseClient,
  prompt: string
): Promise<FilterResult> {
  const filters = await loadContentFilters(adminClient)
  const normalizedPrompt = prompt.toLowerCase().trim()

  for (const filter of filters) {
    let matches = false

    try {
      switch (filter.match_type) {
        case 'exact':
          matches = normalizedPrompt === filter.pattern.toLowerCase()
          break
        case 'contains':
          matches = normalizedPrompt.includes(filter.pattern.toLowerCase())
          break
        case 'regex':
          const regex = new RegExp(filter.pattern, 'i')
          matches = regex.test(normalizedPrompt)
          break
      }
    } catch (e) {
      // Invalid regex - skip this filter
      console.error(`[Moderation] Invalid filter pattern: ${filter.pattern}`, e)
      continue
    }

    if (matches) {
      console.log(`[Moderation] Prompt matched filter: ${filter.category} (severity ${filter.severity})`)
      return {
        passed: false,
        matchedFilter: filter,
        category: filter.category,
        severity: filter.severity,
      }
    }
  }

  return { passed: true }
}

/**
 * Check user's image generation status
 */
export async function checkImageGenStatus(
  adminClient: SupabaseClient,
  userId: string
): Promise<ImageGenStatus> {
  const { data, error } = await adminClient.rpc('check_image_gen_status', {
    p_user_id: userId,
  })

  if (error || !data || data.length === 0) {
    console.error('[Moderation] Failed to check status:', error)
    // Default to allowing (fail open for availability)
    return {
      canGenerate: true,
      status: 'unknown',
      lockedUntil: null,
      message: null,
    }
  }

  const result = data[0]
  return {
    canGenerate: result.can_generate,
    status: result.status,
    lockedUntil: result.locked_until,
    message: result.message,
  }
}

/**
 * Record a content violation
 */
export async function recordImageViolation(
  adminClient: SupabaseClient,
  userId: string,
  violationType: 'pre_filter' | 'fal_rejection' | 'manual',
  prompt: string,
  options: {
    category?: string
    severity?: number
    errorDetail?: string
    metadata?: Record<string, unknown>
  } = {}
): Promise<ViolationResult | null> {
  const promptHash = await hashPrompt(prompt)
  const severity = options.severity ?? 2

  const { data, error } = await adminClient.rpc('record_image_violation', {
    p_user_id: userId,
    p_violation_type: violationType,
    p_category: options.category || null,
    p_severity: severity,
    p_prompt_hash: promptHash,
    p_prompt_length: prompt.length,
    p_error_detail: options.errorDetail || null,
    p_metadata: options.metadata || {},
  })

  if (error || !data || data.length === 0) {
    console.error('[Moderation] Failed to record violation:', error)
    return null
  }

  const result = data[0]
  console.log(`[Moderation] Recorded violation: ${result.action_taken} (new status: ${result.new_status})`)

  return {
    violationId: result.violation_id,
    newStatus: result.new_status,
    lockedUntil: result.locked_until,
    actionTaken: result.action_taken,
  }
}

/**
 * Check if a Fal.ai error is a content policy violation
 */
export function isFalContentPolicyError(status: number, errorData: unknown): boolean {
  if (status !== 422) return false

  // Fal.ai returns 422 for content policy violations
  // Check for common error messages
  const errorStr = JSON.stringify(errorData).toLowerCase()
  return (
    errorStr.includes('content policy') ||
    errorStr.includes('nsfw') ||
    errorStr.includes('inappropriate') ||
    errorStr.includes('violat') ||
    errorStr.includes('not allowed') ||
    errorStr.includes('safety') ||
    errorStr.includes('blocked')
  )
}
