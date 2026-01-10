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

// Model for LoRA-based generation (FLUX models)
const FLUX_LORA_MODEL = 'fal-ai/flux-lora'

// Model for SDXL/SD1.5 with custom checkpoint + LoRA support
const SDXL_LORA_MODEL = 'fal-ai/lora'

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
 * Generate an image using Fal.ai models
 * @param {Object} options
 * @param {string} options.prompt - Text prompt for image generation
 * @param {string} options.style - Style preset key ('comic', 'manga', 'realistic', 'retro', 'none')
 * @param {string} options.model - Model key from AI_MODELS (e.g., 'flux-2-pro', 'flux-2', 'schnell') or 'custom' for project custom model
 * @param {string|{width: number, height: number}} options.imageSize - Image dimensions preset string or custom {width, height}
 * @param {number} options.seed - Optional seed for reproducibility
 * @param {Blob} options.referenceImage - Optional reference image blob for character consistency
 * @param {number} options.referenceStrength - Reference image influence (0-1, default 0.65)
 * @param {boolean} options.allowMature - Allow mature/NSFW content (disables safety filters)
 * @param {Object} options.lora - Optional LoRA configuration
 * @param {string} options.lora.url - LoRA download URL (CivitAI or direct)
 * @param {string} options.lora.triggerWord - Trigger word to activate the LoRA
 * @param {number} options.lora.scale - LoRA strength (0-1, default 0.8)
 * @param {Object} options.customModel - Optional custom base model configuration (from project settings)
 * @param {string} options.customModel.name - Display name of the custom model
 * @param {string} options.customModel.type - Model architecture ('flux', 'sdxl', 'sd15')
 * @param {string} options.customModel.url - CivitAI download URL for the checkpoint
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
  allowMature = false,
  lora = null,
  customModel = null,
  onProgress = null
}) {
  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured. Please add VITE_FAL_AI_KEY to your .env.local file.')
  }

  // Check if using custom model from project settings
  const useCustomModel = modelKey === 'custom' && customModel?.url

  // Validate model selection
  const modelConfig = AI_MODELS[modelKey]
  if (!useCustomModel && !modelConfig) {
    throw new Error(`Invalid model: ${modelKey}. Use one of: ${Object.keys(AI_MODELS).join(', ')}, or 'custom'`)
  }

  // Apply style suffix to prompt
  const styleConfig = AI_STYLES[style] || AI_STYLES.none

  // Build prompt with trigger word if LoRA is provided
  let finalPrompt = prompt
  if (lora?.triggerWord) {
    finalPrompt = `${lora.triggerWord}, ${prompt}`
  }
  const fullPrompt = finalPrompt + styleConfig.suffix

  // Determine which model/endpoint to use
  // Priority: Custom Model > LoRA > Reference > Standard model
  const useLora = lora?.url !== null && lora?.url !== undefined
  const useReference = referenceImage !== null && !useLora && !useCustomModel // Reference not supported with LoRA or custom model

  let modelId
  if (useCustomModel) {
    // Custom model from CivitAI
    if (customModel.type === 'flux') {
      // FLUX custom models use flux-lora endpoint
      modelId = FLUX_LORA_MODEL
    } else {
      // SDXL/SD1.5/Pony use the fal-ai/lora endpoint with model_name
      modelId = SDXL_LORA_MODEL
    }
  } else if (useLora) {
    modelId = FLUX_LORA_MODEL
  } else if (useReference) {
    modelId = FLUX_GENERAL_MODEL
  } else {
    modelId = modelConfig.id
  }

  const input = {
    prompt: fullPrompt,
    image_size: imageSize,
    num_images: 1,
    output_format: 'png'
  }

  // Add custom model URL and SDXL-specific parameters
  if (useCustomModel && customModel.type !== 'flux') {
    input.model_name = customModel.url
    // SDXL/SD1.5 models need guidance_scale and scheduler
    input.guidance_scale = 7.5
    input.scheduler = 'DPM++ 2M Karras'
    input.negative_prompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy'
  }

  // Add inference steps based on model type
  if (useCustomModel && customModel.type !== 'flux') {
    // SDXL/SD1.5 models need more steps
    input.num_inference_steps = 30
  } else if (useCustomModel) {
    // FLUX custom models use standard steps
    input.num_inference_steps = 28
  } else if (useLora) {
    input.num_inference_steps = 28 // Standard steps for LoRA mode
  } else if (modelConfig?.steps !== null && !useReference) {
    input.num_inference_steps = modelConfig.steps
  } else if (useReference) {
    input.num_inference_steps = 28 // Use standard steps for reference mode
  }

  // Add safety/mature content settings
  if (allowMature) {
    // For Pro models, use safety_tolerance (0-6 scale, 6 = most permissive)
    if (modelKey === 'flux-2-pro' && !useCustomModel) {
      input.safety_tolerance = '6'
    } else {
      // For other models and custom models, disable the safety checker
      input.enable_safety_checker = false
    }
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

  // If LoRA provided, add it to input
  // LoRAs work with both standard FLUX models and custom models
  if (useLora) {
    input.loras = [{
      path: lora.url,
      scale: lora.scale ?? 0.8
    }]
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
      fullPrompt: fullPrompt,   // Prompt with style suffix applied (and trigger word if LoRA)
      model: modelKey,          // Model key used (or 'custom')
      customModelName: useCustomModel ? customModel.name : null,
      usedReference: useReference,
      usedLora: useLora,
      usedCustomModel: useCustomModel
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
