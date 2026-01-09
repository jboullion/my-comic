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
 * Style presets that append to prompts for consistent artistic styles
 */
export const AI_STYLES = {
  none: {
    name: 'None',
    suffix: ''
  },
  comic: {
    name: 'Comic Book',
    suffix: ', comic book style, bold ink lines, cel-shaded, vibrant colors, dynamic composition'
  },
  manga: {
    name: 'Manga',
    suffix: ', manga style, black and white, screentone shading, expressive eyes, Japanese comic art'
  },
  realistic: {
    name: 'Realistic',
    suffix: ', photorealistic, highly detailed, professional photography, sharp focus'
  },
  retro: {
    name: 'Retro Comics',
    suffix: ', vintage comic book style, halftone dots, 1960s pop art, bold primary colors'
  }
}

/**
 * Available AI models for image generation
 * Organized by quality tier with FLUX 2 as primary options
 */
export const AI_MODELS = {
  // FLUX 2 Models (newer, better quality)
  'flux-2-pro': {
    id: 'fal-ai/flux-2-pro',
    name: 'FLUX 2 Pro',
    description: 'Best quality, production-ready',
    steps: null, // Pro doesn't use steps parameter
    cost: '~$0.03/MP',
    generation: 2
  },
  'flux-2': {
    id: 'fal-ai/flux-2',
    name: 'FLUX 2 Dev',
    description: 'Great quality, faster',
    steps: 28,
    cost: '~$0.012/MP',
    generation: 2
  },
  // FLUX 1 Models (for compatibility and drafts)
  'schnell': {
    id: 'fal-ai/flux/schnell',
    name: 'FLUX 1 Schnell',
    description: 'Ultra-fast drafts',
    steps: 4,
    cost: '~$0.003/MP',
    generation: 1
  },
  'flux-1-dev': {
    id: 'fal-ai/flux/dev',
    name: 'FLUX 1 Dev',
    description: 'FLUX 1 quality baseline',
    steps: 28,
    cost: '~$0.055/MP',
    generation: 1
  }
}

// Model for reference-based generation (supports IP-Adapter style reference)
const FLUX_GENERAL_MODEL = 'fal-ai/flux-general'

/**
 * Upload an image blob to Fal.ai storage
 * @param {Blob} blob - Image blob to upload
 * @param {string} filename - Filename for the upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export async function uploadImageToFal(blob, filename = 'reference.png') {
  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  // Convert blob to File object
  const file = new File([blob], filename, { type: blob.type || 'image/png' })

  // Upload to Fal storage
  const url = await fal.storage.upload(file)
  return url
}

/**
 * Generate an image using Fal.ai FLUX models
 * @param {Object} options
 * @param {string} options.prompt - Text prompt for image generation
 * @param {string} options.style - Style preset key ('comic', 'manga', 'realistic', 'retro', 'none')
 * @param {string} options.model - Model key from AI_MODELS (e.g., 'flux-2-pro', 'flux-2', 'schnell')
 * @param {string} options.imageSize - Image dimensions preset
 * @param {number} options.seed - Optional seed for reproducibility
 * @param {Blob} options.referenceImage - Optional reference image blob for character consistency
 * @param {number} options.referenceStrength - Reference image influence (0-1, default 0.65)
 * @param {function} options.onProgress - Progress callback for queue updates
 * @returns {Promise<{imageUrl: string, seed: number, width: number, height: number, fullPrompt: string}>}
 */
export async function generateImage({
  prompt,
  style = 'comic',
  model: modelKey = 'flux-2',
  imageSize = 'square_hd',
  seed = null,
  referenceImage = null,
  referenceStrength = 0.65,
  onProgress = null
}) {
  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured. Please add VITE_FAL_AI_KEY to your .env.local file.')
  }

  const modelConfig = AI_MODELS[modelKey]
  if (!modelConfig) {
    throw new Error(`Invalid model: ${modelKey}. Use one of: ${Object.keys(AI_MODELS).join(', ')}`)
  }

  // Apply style suffix to prompt
  const styleConfig = AI_STYLES[style] || AI_STYLES.none
  const fullPrompt = prompt + styleConfig.suffix

  // Determine which model to use
  // If reference image provided and using FLUX 1, use flux-general which supports reference images
  // FLUX 2 models don't support reference images yet, so we fall back to flux-general
  const useReference = referenceImage !== null
  const modelId = useReference ? FLUX_GENERAL_MODEL : modelConfig.id

  const input = {
    prompt: fullPrompt,
    image_size: imageSize,
    num_images: 1,
    output_format: 'png'
  }

  // Add inference steps if the model supports it (Pro models don't use steps)
  if (modelConfig.steps !== null && !useReference) {
    input.num_inference_steps = modelConfig.steps
  } else if (useReference) {
    input.num_inference_steps = 28 // Use standard steps for reference mode
  }

  // Add seed if provided (for regeneration with same seed)
  if (seed !== null) {
    input.seed = seed
  }

  // If reference image provided, upload it and add to input
  if (useReference) {
    try {
      // Update progress to show upload status
      if (onProgress) {
        onProgress({ status: 'UPLOADING', message: 'Uploading reference image...' })
      }

      const referenceUrl = await uploadImageToFal(referenceImage, 'character-reference.png')
      input.reference_image_url = referenceUrl
      input.reference_strength = referenceStrength
      input.reference_end = 0.8 // Stop reference guidance at 80% to allow style to come through
    } catch (uploadError) {
      console.error('Failed to upload reference image:', uploadError)
      throw new Error('Failed to upload reference image. Generating without reference.')
    }
  }

  try {
    const result = await fal.subscribe(modelId, {
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
      prompt: prompt,           // Original prompt without style
      fullPrompt: fullPrompt,   // Prompt with style suffix applied
      model: modelKey,          // Model key used
      usedReference: useReference
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
