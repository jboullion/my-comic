import { fal } from '@fal-ai/client'

const falApiKey = import.meta.env.VITE_FAL_AI_KEY

if (!falApiKey) {
  console.warn(
    'Missing Fal.ai API key. AI image generation will not work.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_FAL_AI_KEY=your-fal-ai-key'
  )
}

// Configure the client (only if key exists)
if (falApiKey) {
  fal.config({
    credentials: falApiKey
  })
}

/**
 * Model configurations for Draft vs Production modes
 */
export const AI_MODELS = {
  draft: {
    id: 'fal-ai/flux/schnell',
    name: 'Draft (Fast)',
    description: 'Quick iterations, lower quality',
    steps: 4,
    cost: '~$0.003/image'
  },
  production: {
    id: 'fal-ai/flux/dev',
    name: 'Production (Quality)',
    description: 'Higher quality, slower',
    steps: 28,
    cost: '~$0.05/image'
  }
}

/**
 * Generate an image using Fal.ai FLUX models
 * @param {Object} options
 * @param {string} options.prompt - Text prompt for image generation
 * @param {string} options.mode - 'draft' or 'production'
 * @param {string} options.imageSize - Image dimensions preset
 * @param {number} options.seed - Optional seed for reproducibility
 * @param {function} options.onProgress - Progress callback for queue updates
 * @returns {Promise<{imageUrl: string, seed: number, width: number, height: number}>}
 */
export async function generateImage({
  prompt,
  mode = 'draft',
  imageSize = 'square_hd',
  seed = null,
  onProgress = null
}) {
  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured. Please add VITE_FAL_AI_KEY to your .env.local file.')
  }

  const model = AI_MODELS[mode]
  if (!model) {
    throw new Error(`Invalid mode: ${mode}. Use 'draft' or 'production'.`)
  }

  const input = {
    prompt,
    image_size: imageSize,
    num_inference_steps: model.steps,
    num_images: 1,
    output_format: 'png'
  }

  // Add seed if provided (for regeneration with same seed)
  if (seed !== null) {
    input.seed = seed
  }

  try {
    const result = await fal.subscribe(model.id, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (onProgress) {
          onProgress({
            status: update.status,
            position: update.queue_position,
            logs: update.logs
          })
        }
      }
    })

    // Extract first image from result
    const image = result.data.images[0]

    return {
      imageUrl: image.url,
      width: image.width,
      height: image.height,
      seed: result.data.seed,
      prompt: result.data.prompt
    }
  } catch (error) {
    // Re-throw with more context
    if (error.message?.includes('401')) {
      throw new Error('Invalid Fal.ai API key. Please check your VITE_FAL_AI_KEY.')
    }
    if (error.message?.includes('402')) {
      throw new Error('Insufficient Fal.ai credits. Please add credits to your account.')
    }
    throw new Error(`Image generation failed: ${error.message}`)
  }
}

/**
 * Fetch image from URL and convert to Blob
 * @param {string} imageUrl - URL of the generated image
 * @returns {Promise<Blob>}
 */
export async function fetchImageAsBlob(imageUrl) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch generated image')
  }
  return await response.blob()
}

/**
 * Check if Fal.ai is configured
 */
export function isFalConfigured() {
  return !!falApiKey
}
