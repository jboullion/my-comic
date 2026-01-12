import { fal } from '@fal-ai/client'

const falApiKey = import.meta.env.VITE_FAL_AI_KEY
const openRouterKey = import.meta.env.VITE_OPENROUTER_KEY

if (!falApiKey) {
  console.warn(
    'Missing Fal.ai API key. AI image generation will not work.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_FAL_AI_KEY=your-fal-ai-key'
  )
}

if (!openRouterKey) {
  console.warn(
    'Missing OpenRouter API key. Vision-based Story AI will not work.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_OPENROUTER_KEY=your-openrouter-key\n' +
    'Get a key at: https://openrouter.ai/keys'
  )
}

// Configure the client (only if key exists)
// Note: Browser console will show a warning about credentials being exposed.
// This is expected for this PWA - users provide their own API keys client-side.
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
  // // Pony V7 - great for stylized art
  // 'pony-v7': {
  //   id: 'fal-ai/pony-v7',
  //   name: 'Pony V7',
  //   description: 'Stylized art, anime-friendly',
  //   steps: 40,
  //   cost: '~$0.02/MP',
  //   generation: 1
  // },
  // Fast, affordable model (uses aspect_ratio instead of image_size)
  'nano-banana': {
    id: 'fal-ai/nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'Ultra-fast, budget-friendly',
    steps: null, // Doesn't use steps parameter
    cost: '~$0.001/MP',
    generation: 2,
    usesAspectRatio: true // Uses aspect_ratio instead of image_size
  }
}

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
 * @param {boolean} options.allowMature - Allow mature/NSFW content (disables safety filters)
 * @param {Object} options.lora - Optional LoRA configuration (only for custom models, not FLUX)
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
  // Priority: Custom Model > LoRA > Standard model
  const useLora = lora?.url !== null && lora?.url !== undefined

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
  } else {
    modelId = modelConfig.id
  }

  const input = {
    prompt: fullPrompt,
    num_images: 1,
    output_format: 'png'
  }

  // Handle image size - Nano Banana uses aspect_ratio, others use image_size
  if (modelConfig?.usesAspectRatio) {
    // Convert image_size to aspect_ratio for Nano Banana
    // Supported: 21:9, 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4, 2:3, 9:16
    let aspectRatio = '1:1' // Default
    if (typeof imageSize === 'object') {
      // Calculate closest aspect ratio from width/height
      const ratio = imageSize.width / imageSize.height
      console.log('[Nano Banana] Custom dimensions:', imageSize, 'ratio:', ratio)
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
      // Map preset strings to aspect ratios
      const presetMap = {
        'square_hd': '1:1',
        'square': '1:1',
        'portrait_4_3': '3:4',
        'portrait_16_9': '9:16',
        'landscape_4_3': '4:3',
        'landscape_16_9': '16:9'
      }
      aspectRatio = presetMap[imageSize] || '1:1'
      console.log('[Nano Banana] Preset:', imageSize, '-> aspect_ratio:', aspectRatio)
    }
    console.log('[Nano Banana] Final aspect_ratio:', aspectRatio)
    input.aspect_ratio = aspectRatio
  } else {
    // Standard image_size for FLUX and Pony models
    input.image_size = imageSize
  }

  // Add custom model URL and SDXL-specific parameters
  if (useCustomModel && customModel.type !== 'flux') {
    input.model_name = customModel.url
    // SDXL/SD1.5 models need guidance_scale and scheduler
    input.guidance_scale = 7.5
    input.scheduler = 'DPM++ 2M Karras'
    input.negative_prompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy'
  }

  // Add inference steps based on model type (skip for models that don't use it)
  if (modelConfig?.usesAspectRatio) {
    // Nano Banana doesn't use inference steps
  } else if (useCustomModel && customModel.type !== 'flux') {
    // SDXL/SD1.5 models need more steps
    input.num_inference_steps = 30
  } else if (useCustomModel) {
    // FLUX custom models use standard steps
    input.num_inference_steps = 28
  } else if (useLora) {
    input.num_inference_steps = 28 // Standard steps for LoRA mode
  } else if (modelConfig?.steps !== null) {
    input.num_inference_steps = modelConfig.steps
  }

  // Add safety/mature content settings
  if (allowMature) {
    // For Pro models, use safety_tolerance (1-5 scale, 5 = most permissive)
    if (modelKey === 'flux-2-pro' && !useCustomModel) {
      input.safety_tolerance = '5'
    } else {
      // For other models and custom models, disable the safety checker
      input.enable_safety_checker = false
    }
  }

  // Add seed if provided (for regeneration with same seed)
  if (seed !== null) {
    input.seed = seed
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

/**
 * Enhance an image prompt using Fal.ai LLM
 * Takes a basic user prompt and expands it into a detailed, descriptive prompt
 * optimized for AI image generation.
 * 
 * @param {string} userPrompt - Basic prompt from user
 * @param {Object} options - Enhancement options
 * @param {string} options.style - Style preset key for context
 * @param {Array<{name: string, description: string}>} options.characters - Selected characters for context
 * @returns {Promise<string>} - Enhanced prompt
 */
export async function enhanceImagePrompt(userPrompt, options = {}) {
  const {
    style = 'comic',
    characters = []
  } = options

  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  // Get style name for context
  const styleName = AI_STYLES[style]?.name || 'Comic Book'

  // Build character context if provided
  const characterContext = characters.length > 0
    ? `\nCharacters that may appear: ${characters.map(c => `${c.name} (${c.description || 'no description'})`).join(', ')}`
    : ''

  // System prompt focused on comic book image generation
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

    // Extract the output text - fal-ai/any-llm returns { output: string }
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
 * Available LLM models for Story AI chat
 * All models are vision-capable (multimodal)
 * Updated January 2026
 */
export const STORY_AI_MODELS = {
  // === GOOGLE GEMINI ===
  'gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Fast Google model, vision capable',
    vision: true,
    premium: false
  },
  'gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google flagship, vision capable',
    vision: true,
    premium: true
  },
  // === ANTHROPIC CLAUDE ===
  'claude-sonnet-4.5': {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Latest Anthropic flagship',
    vision: true,
    premium: true
  },
  'claude-haiku-4.5': {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Fast Claude 4.5',
    vision: true,
    premium: true
  },

  // === OPENAI ===
  'gpt-5': {
    id: 'openai/gpt-5-chat',
    name: 'GPT-5',
    description: 'OpenAI flagship',
    vision: true,
    premium: true
  },
  'gpt-5-mini': {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'Smaller GPT-5',
    vision: true,
    premium: true
  },
  'gpt-5-nano': {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    description: 'Tiny GPT-5',
    vision: true,
    premium: false
  },

  // === META LLAMA ===
  'llama-3.2-90b-vision': {
    id: 'meta-llama/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision',
    description: 'Large vision model',
    vision: true,
    premium: true
  }
}

/**
 * Call OpenRouter directly for vision-capable LLM requests
 * OpenRouter supports proper multimodal message format
 */
async function callOpenRouterVision(modelId, systemPrompt, userMessage, imageUrl, chatHistory = []) {
  if (!openRouterKey) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_KEY to your .env.local file. Get a key at https://openrouter.ai/keys')
  }

  // Build messages array with proper vision format
  const messages = [
    { role: 'system', content: systemPrompt }
  ]
  
  // Add chat history
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    })
  }
  
  // Add current message with image
  messages.push({
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: { url: imageUrl }
      },
      {
        type: 'text',
        text: userMessage
      }
    ]
  })

  console.log('[Story AI] Calling OpenRouter directly for vision...')
  console.log('[Story AI] Model:', modelId)
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Comic Book Maker'
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      max_tokens: 800,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[Story AI] OpenRouter error:', errorData)
    throw new Error(errorData.error?.message || `OpenRouter request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Chat with Story AI assistant for comic writing help
 * Supports vision models with canvas screenshot
 * 
 * @param {string} userMessage - The user's message/question
 * @param {Object} options - Chat options
 * @param {string} options.model - Model key from STORY_AI_MODELS (default: 'claude-3.5-sonnet')
 * @param {string} options.imageUrl - URL of canvas screenshot (for vision models)
 * @param {Array<{role: string, content: string}>} options.chatHistory - Previous messages for context
 * @param {Object} options.projectContext - Current project context
 * @param {string} options.projectContext.title - Project title
 * @param {number} options.projectContext.pageNumber - Current page number
 * @param {number} options.projectContext.totalPages - Total pages in project
 * @param {Array<{name: string, description: string}>} options.projectContext.characters - Characters in series
 * @returns {Promise<string>} - AI response
 */
export async function chatWithStoryAI(userMessage, options = {}) {
  const { 
    model: modelKey = 'claude-3.5-sonnet',
    imageUrl = null,
    chatHistory = [], 
    projectContext = {} 
  } = options

  if (!falApiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  // Get model config
  const modelConfig = STORY_AI_MODELS[modelKey]
  if (!modelConfig) {
    throw new Error(`Invalid model: ${modelKey}`)
  }

  // Build character context
  const characterList = projectContext.characters?.length > 0
    ? projectContext.characters.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n')
    : 'No characters defined yet.'

  // System prompt for story assistance (simplified for vision mode)
  const systemPrompt = `You are an expert comic book writer and story assistant. You help users create compelling comic book stories with vivid dialogue, interesting plots, and memorable characters.

## Current Project Context
- **Title:** ${projectContext.title || 'Untitled'}
- **Current Page:** ${projectContext.pageNumber || 1} of ${projectContext.totalPages || 1}

## Characters
${characterList}

## Your Capabilities
1. **Visual Analysis:** Describe what you see in the comic page image
2. **Dialogue Writing:** Suggest natural, character-appropriate dialogue for speech bubbles
3. **Plot Development:** Help with story arcs, plot twists, and narrative flow
4. **Character Development:** Suggest character motivations, backstories, and growth
5. **Image Prompts:** Convert story ideas into detailed AI image generation prompts
6. **Pacing:** Advise on panel layout and story pacing

## Guidelines
- Be creative and helpful
- Keep responses concise but useful (under 300 words unless more detail is requested)
- When suggesting dialogue, format it clearly
- When generating image prompts, be detailed and visual
- Consider the established characters and their personalities
- When an image is provided, analyze what you see and reference visual elements`

  try {
    // For vision models with an image, call OpenRouter directly
    // because fal-ai/any-llm doesn't support vision
    if (imageUrl && modelConfig.vision) {
      console.log('[Story AI] Using OpenRouter for vision request...')
      const response = await callOpenRouterVision(
        modelConfig.id,
        systemPrompt,
        userMessage,
        imageUrl,
        chatHistory
      )
      return response.trim()
    }
    
    // For text-only requests, use fal-ai/any-llm
    const input = {
      model: modelConfig.id,
      system_prompt: systemPrompt,
      max_tokens: 800,
      temperature: 0.7,
      prompt: userMessage
    }
    
    // Add chat history if available
    if (chatHistory.length > 0) {
      input.chat_history = chatHistory.map(m => ({
        role: m.role,
        content: m.content
      }))
    }
    
    console.log('[Story AI] Sending text-only request via Fal.ai')

    const result = await fal.subscribe('fal-ai/any-llm', { input })

    const output = result.data?.output || result.output || ''
    return output.trim()
  } catch (error) {
    if (error.message?.includes('401')) {
      throw new Error('Invalid Fal.ai API key')
    }
    if (error.message?.includes('402')) {
      throw new Error('Insufficient Fal.ai credits')
    }
    throw new Error(`Story AI failed: ${error.message}`)
  }
}

