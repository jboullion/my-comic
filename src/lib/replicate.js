import Replicate from 'replicate'
import { AI_STYLES } from './falai'

const replicateApiKey = import.meta.env.VITE_REPLICATE_API_KEY

if (!replicateApiKey) {
  console.warn(
    'Missing Replicate API key. AI image generation with Replicate will not work.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_REPLICATE_API_KEY=your-replicate-api-key'
  )
}

// Configure the Replicate client
let replicate = null
if (replicateApiKey) {
  replicate = new Replicate({
    auth: replicateApiKey
  })
}

/**
 * Available AI models for Replicate image generation
 * Organized by quality tier with FLUX models as primary options
 */
export const AI_MODELS = {
  // FLUX Models
  'flux-2-pro': {
    id: 'black-forest-labs/flux-1.1-pro',
    name: 'FLUX 1.1 Pro',
    description: 'Best quality, production-ready',
    cost: '~$0.04/image',
    generation: 2,
    supportsLoRA: false // Pro doesn't support LoRA
  },
  'flux-2': {
    id: 'black-forest-labs/flux-dev',
    name: 'FLUX Dev',
    description: 'Great quality, faster',
    cost: '~$0.025/image',
    generation: 2,
    supportsLoRA: true
  },
  'flux-schnell': {
    id: 'black-forest-labs/flux-schnell',
    name: 'FLUX Schnell',
    description: 'Ultra-fast, budget-friendly',
    cost: '~$0.003/image',
    generation: 1,
    supportsLoRA: true
  }
}

// Map common image size presets to aspect ratios
const IMAGE_SIZE_MAP = {
  'square_hd': { aspect_ratio: '1:1', width: 1024, height: 1024 },
  'portrait_4_3': { aspect_ratio: '3:4', width: 768, height: 1024 },
  'portrait_16_9': { aspect_ratio: '9:16', width: 576, height: 1024 },
  'landscape_4_3': { aspect_ratio: '4:3', width: 1024, height: 768 },
  'landscape_16_9': { aspect_ratio: '16:9', width: 1024, height: 576 }
}

/**
 * Convert image size preset or custom dimensions to Replicate format
 * @param {string|{width: number, height: number}} imageSize
 * @returns {{aspect_ratio?: string, width?: number, height?: number}}
 */
function convertImageSize(imageSize) {
  if (typeof imageSize === 'string') {
    const sizeConfig = IMAGE_SIZE_MAP[imageSize]
    if (sizeConfig) {
      // Use aspect ratio for standard presets (Replicate handles better)
      return { aspect_ratio: sizeConfig.aspect_ratio }
    }
    // If unknown preset, default to square
    return { aspect_ratio: '1:1' }
  }

  // Custom dimensions provided
  if (imageSize.width && imageSize.height) {
    // Ensure dimensions are divisible by 8 (Replicate requirement)
    const width = Math.round(imageSize.width / 8) * 8
    const height = Math.round(imageSize.height / 8) * 8
    return { width, height }
  }

  // Fallback to square
  return { aspect_ratio: '1:1' }
}

/**
 * Generate an image using Replicate models
 * @param {Object} options
 * @param {string} options.prompt - Text prompt for image generation
 * @param {string} options.style - Style preset key ('comic', 'manga', 'realistic', 'retro', 'none')
 * @param {string} options.model - Model key from AI_MODELS (e.g., 'flux-2-pro', 'flux-2', 'flux-schnell')
 * @param {string|{width: number, height: number}} options.imageSize - Image dimensions preset string or custom {width, height}
 * @param {number} options.seed - Optional seed for reproducibility
 * @param {Object} options.lora - Optional LoRA configuration
 * @param {string} options.lora.url - LoRA URL (Hugging Face or CivitAI)
 * @param {string} options.lora.triggerWord - Trigger word to activate the LoRA
 * @param {number} options.lora.scale - LoRA strength (0-1, default 0.8)
 * @param {Object} options.customModel - Optional custom fine-tuned model (Replicate model ID)
 * @param {string} options.customModel.replicateModel - Replicate model ID (e.g., 'username/model:version')
 * @param {function} options.onProgress - Progress callback for status updates
 * @returns {Promise<{imageUrl: string, seed: number, width: number, height: number, fullPrompt: string}>}
 */
export async function generateImage({
  prompt,
  style = 'comic',
  model: modelKey = 'flux-2',
  imageSize = 'square_hd',
  seed = null,
  lora = null,
  customModel = null,
  onProgress = null
}) {
  if (!replicateApiKey || !replicate) {
    throw new Error('Replicate API key not configured. Please add VITE_REPLICATE_API_KEY to your .env.local file.')
  }

  // Check if using custom fine-tuned model
  const useCustomModel = customModel?.replicateModel

  // Validate model selection
  const modelConfig = AI_MODELS[modelKey]
  if (!useCustomModel && !modelConfig) {
    throw new Error(`Invalid model: ${modelKey}. Use one of: ${Object.keys(AI_MODELS).join(', ')}`)
  }

  // Apply style suffix to prompt
  const styleConfig = AI_STYLES[style] || AI_STYLES.none

  // Build prompt with trigger word if LoRA is provided
  let finalPrompt = prompt
  if (lora?.triggerWord) {
    finalPrompt = `${lora.triggerWord}, ${prompt}`
  }
  const fullPrompt = finalPrompt + styleConfig.suffix

  // Determine model ID
  const modelId = useCustomModel ? customModel.replicateModel : modelConfig.id

  // Check LoRA compatibility
  const useLora = lora?.url !== null && lora?.url !== undefined
  if (useLora && modelConfig && !modelConfig.supportsLoRA) {
    console.warn(`Model ${modelKey} does not support LoRA. Generating without LoRA.`)
  }

  // Build input parameters
  const input = {
    prompt: fullPrompt,
    num_outputs: 1,
    output_format: 'png',
    output_quality: 90
  }

  // Add image size parameters
  const sizeParams = convertImageSize(imageSize)
  Object.assign(input, sizeParams)

  // Add seed if provided
  if (seed !== null) {
    input.seed = seed
  }

  // Add LoRA if supported and provided
  if (useLora && (modelConfig?.supportsLoRA || useCustomModel)) {
    // Replicate supports LoRA via hf_lora parameter
    // Accept Hugging Face URLs directly
    input.hf_lora = lora.url
    input.lora_scale = lora.scale ?? 0.8
  }

  // Add guidance scale for better prompt adherence
  if (!useCustomModel) {
    input.guidance = 3.5 // FLUX models use lower guidance
  }

  try {
    // Update progress to starting
    if (onProgress) {
      onProgress({ status: 'starting', message: 'Starting generation...' })
    }

    // Run prediction with polling
    const output = await replicate.run(
      modelId,
      {
        input,
        wait: { interval: 500 } // Poll every 500ms
      },
      (prediction) => {
        // Progress callback during prediction
        if (onProgress) {
          let status = 'processing'
          let message = 'Generating image...'

          if (prediction.status === 'starting') {
            status = 'starting'
            message = 'Starting generation...'
          } else if (prediction.status === 'processing') {
            status = 'processing'
            message = 'Generating image...'
          }

          onProgress({ status, message })
        }
      }
    )

    // Extract image URL from output
    // Replicate returns either a single URL or array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output

    // Fetch image to get dimensions
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch generated image')
    }

    const blob = await response.blob()

    // Create temporary image to get dimensions
    const img = new Image()
    const objectUrl = URL.createObjectURL(blob)

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = objectUrl
    })

    const width = img.width
    const height = img.height
    URL.revokeObjectURL(objectUrl)

    // Note: Replicate doesn't return the seed in the response
    // If user provided seed, use that, otherwise set to null
    const returnedSeed = seed ?? null

    return {
      imageUrl,
      width,
      height,
      seed: returnedSeed,
      prompt: prompt,           // Original prompt without style
      fullPrompt: fullPrompt,   // Prompt with style suffix applied
      model: modelKey,          // Model key used
      customModelName: useCustomModel ? customModel.replicateModel : null,
      usedReference: false,     // Replicate doesn't support reference images in this implementation
      usedLora: useLora && (modelConfig?.supportsLoRA || useCustomModel),
      usedCustomModel: useCustomModel
    }
  } catch (error) {
    // Re-throw with more context
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Invalid Replicate API key. Please check your VITE_REPLICATE_API_KEY.')
    }
    if (error.message?.includes('402') || error.message?.includes('insufficient')) {
      throw new Error('Insufficient Replicate credits. Please add credits to your account.')
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
 * Check if Replicate is configured
 */
export function isReplicateConfigured() {
  return !!replicateApiKey
}

// Re-export AI_STYLES for convenience
export { AI_STYLES }
