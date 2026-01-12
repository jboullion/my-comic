/**
 * Fal.ai Integration for Image Generation
 * Handles FLUX models, custom models, LoRAs, and CivitAI integrations
 */

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
    steps: null,
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
  'nano-banana': {
    id: 'fal-ai/nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'Ultra-fast, budget-friendly',
    steps: null,
    cost: '~$0.001/MP',
    generation: 2,
    usesAspectRatio: true
  }
}

const FLUX_LORA_MODEL = 'fal-ai/flux-lora'
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

  const file = new File([blob], filename, { type: blob.type || 'image/png' })
  const url = await fal.storage.upload(file)
  return url
}

/**
 * Generate an image using Fal.ai models
 * @param {Object} options - Generation options
 * @returns {Promise<{imageUrl: string, seed: number, width: number, height: number, fullPrompt: string}>}
 */
export async function generateImage({
  prompt,
  style = 'comic',
  model: modelKey = 'flux-2',
  imageSize = 'square_hd',
  seed = null,
  allowMature = false,
  lora = null,
  customModel = null,
  onProgress = null
}) {
  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured. Please add VITE_FAL_AI_KEY to your .env.local file.')
  }

  const useCustomModel = modelKey === 'custom' && customModel?.url
  const modelConfig = AI_MODELS[modelKey]
  
  if (!useCustomModel && !modelConfig) {
    throw new Error(`Invalid model: ${modelKey}`)
  }

  const styleConfig = AI_STYLES[style] || AI_STYLES.none

  let finalPrompt = prompt
  if (lora?.triggerWord) {
    finalPrompt = `${lora.triggerWord}, ${prompt}`
  }
  const fullPrompt = finalPrompt + styleConfig.suffix

  const useLora = lora?.url !== null && lora?.url !== undefined

  let modelId
  if (useCustomModel) {
    modelId = customModel.type === 'flux' ? FLUX_LORA_MODEL : SDXL_LORA_MODEL
  } else if (useLora) {
    modelId = FLUX_LORA_MODEL
  } else {
    modelId = modelConfig.id
  }

  const input = {
    prompt: fullPrompt,
    num_images: 1,
    output_format: 'png'
  }

  if (modelConfig?.usesAspectRatio) {
    let aspectRatio = '1:1'
    if (typeof imageSize === 'object') {
      const ratio = imageSize.width / imageSize.height
      if (ratio > 2) aspectRatio = '21:9'
      else if (ratio > 1.6) aspectRatio = '16:9'
      else if (ratio > 1.4) aspectRatio = '3:2'
      else if (ratio > 1.2) aspectRatio = '4:3'
      else if (ratio > 1.05) aspectRatio = '5:4'
      else if (ratio > 0.95) aspectRatio = '1:1'
      else if (ratio > 0.75) aspectRatio = '4:5'
      else if (ratio > 0.65) aspectRatio = '3:4'
      else if (ratio > 0.55) aspectRatio = '2:3'
      else aspectRatio = '9:16'
    } else if (typeof imageSize === 'string') {
      const presetMap = {
        'square_hd': '1:1',
        'square': '1:1',
        'portrait_4_3': '3:4',
        'portrait_16_9': '9:16',
        'landscape_4_3': '4:3',
        'landscape_16_9': '16:9'
      }
      aspectRatio = presetMap[imageSize] || '1:1'
    }
    input.aspect_ratio = aspectRatio
  } else {
    input.image_size = imageSize
  }

  if (useCustomModel && customModel.type !== 'flux') {
    input.model_name = customModel.url
    input.guidance_scale = 7.5
    input.scheduler = 'DPM++ 2M Karras'
    input.negative_prompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy'
  }

  if (modelConfig?.usesAspectRatio) {
    // Nano Banana doesn't use inference steps
  } else if (useCustomModel && customModel.type !== 'flux') {
    input.num_inference_steps = 30
  } else if (useCustomModel) {
    input.num_inference_steps = 28
  } else if (useLora) {
    input.num_inference_steps = 28
  } else if (modelConfig?.steps !== null) {
    input.num_inference_steps = modelConfig.steps
  }

  if (allowMature) {
    if (modelKey === 'flux-2-pro' && !useCustomModel) {
      input.safety_tolerance = '5'
    } else {
      input.enable_safety_checker = false
    }
  }

  if (seed !== null) {
    input.seed = seed
  }

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

    const image = result.data.images[0]

    return {
      imageUrl: image.url,
      width: image.width,
      height: image.height,
      seed: result.data.seed,
      prompt: prompt,
      fullPrompt: fullPrompt,
      model: modelKey,
      customModelName: useCustomModel ? customModel.name : null,
      usedLora: useLora,
      usedCustomModel: useCustomModel
    }
  } catch (error) {
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
 * Enhance an image prompt using Fal.ai LLM
 * @param {string} userPrompt - Basic prompt from user
 * @param {Object} options - Enhancement options
 * @returns {Promise<string>} - Enhanced prompt
 */
export async function enhanceImagePrompt(userPrompt, options = {}) {
  const { style = 'comic', characters = [] } = options

  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  const styleName = AI_STYLES[style]?.name || 'Comic Book'
  const characterContext = characters.length > 0
    ? `\nCharacters that may appear: ${characters.map(c => `${c.name} (${c.description || 'no description'})`).join(', ')}`
    : ''

  const systemPrompt = `You are an expert at writing detailed image generation prompts for AI models like FLUX.
Your goal is to take a basic user prompt and expand it into a detailed, descriptive prompt that will produce high-quality ${styleName} artwork.

Focus on:
- Visual details (poses, expressions, clothing, lighting, environment)
- Composition and framing (camera angle, perspective, focus)
- Artistic style elements (line work, colors, shading, mood)
- Maintaining the user's original intent and subject matter

Rules:
- Keep it under 120 words
- Do NOT include style suffixes (those are added automatically)
- Do NOT include negative prompts
- Write as a single descriptive paragraph
- Be specific but don't overload with conflicting details${characterContext}

Return ONLY the enhanced prompt, no explanations or formatting.`

  try {
    const result = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: 'meta-llama/llama-3.1-70b-instruct',
        prompt: `User's basic prompt: "${userPrompt}"\n\nExpand this into a detailed image generation prompt:`,
        system_prompt: systemPrompt,
        max_tokens: 300,
        temperature: 0.7
      }
    })

    const enhanced = result.data?.output || result.output || ''
    return enhanced.trim()
  } catch (error) {
    if (error.message?.includes('401')) {
      throw new Error('Invalid Fal.ai API key')
    }
    throw new Error(`Prompt enhancement failed: ${error.message}`)
  }
}

/**
 * Check if Fal.ai is configured
 */
export function isFalConfigured() {
  return !!falApiKey
}
