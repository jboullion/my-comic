/**
 * CivitAI API Client
 *
 * Provides functions to interact with the CivitAI REST API for browsing
 * models (Checkpoints and LoRAs). API key is stored in localStorage.
 *
 * API Docs: https://developer.civitai.com/docs/api/public-rest
 */

// Use proxy to avoid CORS issues (Vite proxy in dev, Netlify redirect in prod)
const CIVITAI_API_BASE = '/api/civitai'
const STORAGE_KEY = 'civitai-api-key'

// ============================================================================
// Types
// ============================================================================

export interface CivitAIModel {
  id: number
  name: string
  description?: string
  type: 'Checkpoint' | 'LORA' | 'TextualInversion' | 'Hypernetwork' | 'AestheticGradient' | 'Controlnet'
  nsfw: boolean
  creator: {
    username: string
    image?: string
  }
  modelVersions: CivitAIModelVersion[]
  stats: {
    downloadCount: number
    favoriteCount: number
    thumbsUpCount: number
    rating: number
    ratingCount: number
  }
}

export interface CivitAIModelVersion {
  id: number
  name: string
  baseModel: string // 'SDXL 1.0', 'SD 1.5', 'Pony', 'Flux.1 D', etc.
  downloadUrl: string
  images: CivitAIImage[]
  trainedWords?: string[] // Trigger words for LoRAs
  files: CivitAIFile[]
}

export interface CivitAIImage {
  url: string
  nsfw: 'None' | 'Soft' | 'Mature' | 'X'
  width: number
  height: number
}

export interface CivitAIFile {
  id: number
  name: string
  sizeKB: number
  type: string
  format: string
  downloadUrl: string
}

export interface FetchModelsOptions {
  query?: string
  types?: ('Checkpoint' | 'LORA')[]
  baseModels?: string[]
  favorites?: boolean
  limit?: number
  cursor?: string
  nsfw?: boolean
}

export interface PaginatedResponse {
  items: CivitAIModel[]
  metadata: {
    nextCursor?: string
    currentPage: number
    pageSize: number
    totalItems?: number
  }
}

export type BrowserMode = 'checkpoint' | 'lora'

// ============================================================================
// API Key Management
// ============================================================================

/**
 * Get the stored CivitAI API key
 */
export function getCivitaiApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Store the CivitAI API key
 */
export function setCivitaiApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

/**
 * Remove the stored CivitAI API key
 */
export function removeCivitaiApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Check if CivitAI is configured (has API key)
 */
export function isCivitaiConfigured(): boolean {
  const key = getCivitaiApiKey()
  return key !== null && key.trim().length > 0
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Make an authenticated request to the CivitAI API
 */
async function civitaiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const apiKey = getCivitaiApiKey()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (apiKey) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(`${CIVITAI_API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  return response
}

/**
 * Validate an API key by making a test request
 * Returns true if the key is valid, false otherwise
 */
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${CIVITAI_API_BASE}/models?limit=1`, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    })

    // 200 = valid, 401 = invalid
    return response.ok
  } catch (error) {
    console.error('CivitAI API validation error:', error)
    return false
  }
}

/**
 * Fetch models from CivitAI
 *
 * @param mode - 'checkpoint' or 'lora' - determines which type filter to use
 * @param options - Additional filter options
 */
export async function fetchModels(
  mode: BrowserMode,
  options: FetchModelsOptions = {}
): Promise<PaginatedResponse> {
  const params = new URLSearchParams()

  // Set type based on mode (locked, user cannot change)
  const modelType = mode === 'checkpoint' ? 'Checkpoint' : 'LORA'
  params.set('types', modelType)

  // Note: CivitAI's query parameter doesn't work reliably (returns empty results)
  // Search filtering is done client-side instead
  if (options.query) {
    params.set('query', options.query)
  }

  if (options.baseModels && options.baseModels.length > 0) {
    // CivitAI accepts multiple baseModels as comma-separated
    options.baseModels.forEach(bm => params.append('baseModels', bm))
  }

  if (options.favorites) {
    params.set('favorites', 'true')
  }

  // Pagination
  params.set('limit', String(options.limit || 20))

  if (options.cursor) {
    params.set('cursor', options.cursor)
  }

  // NSFW filter - only set if allowing NSFW content
  // CivitAI defaults to SFW if not specified
  if (options.nsfw) {
    params.set('nsfw', 'true')
  }

  const response = await civitaiFetch(`/models?${params.toString()}`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`CivitAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    items: data.items || [],
    metadata: data.metadata || {
      currentPage: 1,
      pageSize: options.limit || 20,
    },
  }
}

/**
 * Get the download URL for a model version
 * Includes API key as query parameter for authenticated downloads
 */
export function getDownloadUrl(modelVersionId: number): string {
  const apiKey = getCivitaiApiKey()
  const baseUrl = `https://civitai.com/api/download/models/${modelVersionId}`

  if (apiKey) {
    return `${baseUrl}?token=${apiKey}`
  }

  return baseUrl
}

/**
 * Map CivitAI base model string to our internal model type
 */
export function mapBaseModelToType(baseModel: string): 'flux' | 'sdxl' | 'sd15' {
  const lower = baseModel.toLowerCase()

  if (lower.includes('flux')) {
    return 'flux'
  }

  if (lower.includes('sdxl') || lower.includes('pony')) {
    return 'sdxl'
  }

  // Default to SD 1.5
  return 'sd15'
}

/**
 * Get the first safe-for-work thumbnail from a model
 */
export function getModelThumbnail(model: CivitAIModel): string | null {
  for (const version of model.modelVersions) {
    for (const image of version.images) {
      if (image.nsfw === 'None' || image.nsfw === 'Soft') {
        return image.url
      }
    }
  }

  // Fallback to first image if no SFW found
  const firstImage = model.modelVersions[0]?.images[0]
  return firstImage?.url || null
}

/**
 * Get the latest version of a model
 */
export function getLatestVersion(model: CivitAIModel): CivitAIModelVersion | null {
  return model.modelVersions[0] || null
}

/**
 * Get trigger words for a LoRA model
 */
export function getTriggerWords(model: CivitAIModel): string[] {
  const version = getLatestVersion(model)
  return version?.trainedWords || []
}

// ============================================================================
// Base Model Options (for filter dropdown)
// ============================================================================

export const BASE_MODEL_OPTIONS = [
  { value: '', label: 'All Base Models' },
  { value: 'SDXL 1.0', label: 'SDXL 1.0' },
  { value: 'SD 1.5', label: 'SD 1.5' },
  { value: 'Pony', label: 'Pony' },
  { value: 'Flux.1 D', label: 'FLUX Dev' },
  { value: 'Flux.1 S', label: 'FLUX Schnell' },
]
