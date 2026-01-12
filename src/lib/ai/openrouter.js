/**
 * OpenRouter Integration for Story AI Chat
 * Handles vision-capable LLM models for comic writing assistance
 */

const openRouterKey = import.meta.env.VITE_OPENROUTER_KEY

if (!openRouterKey) {
  console.warn(
    'Missing OpenRouter API key. Vision-based Story AI will not work.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_OPENROUTER_KEY=your-openrouter-key\n' +
    'Get a key at: https://openrouter.ai/keys'
  )
}

/**
 * Available LLM models for Story AI chat
 * All models are vision-capable (multimodal)
 * Pricing in USD per million tokens
 * Updated January 2026
 */
export const STORY_AI_MODELS = {
  // === GOOGLE GEMINI ===
  google: {
    'gemini-2.5-flash': {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Fast multimodal, great for iteration',
      vision: true,
      inputPrice: 0.50,
      outputPrice: 3.00
    },
    'gemini-3-flash': {
      id: 'google/gemini-3-flash-preview',
      name: 'Gemini 3 Flash Preview',
      description: 'Newest, strong reasoning',
      vision: true,
      inputPrice: 0.50,
      outputPrice: 3.00
    },
    'gemini-2.5-pro': {
      id: 'google/gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Google flagship, highest quality',
      vision: true,
      inputPrice: 2.50,
      outputPrice: 10.00
    },
    'gemini-2.0-flash': {
      id: 'google/gemini-2.0-flash-001',
      name: 'Gemini 2.0 Flash',
      description: 'Previous gen, still fast',
      vision: true,
      inputPrice: 0.10,
      outputPrice: 0.40
    }
  },

  // === ANTHROPIC CLAUDE ===
  anthropic: {
    'claude-sonnet-4.5': {
      id: 'anthropic/claude-sonnet-4.5',
      name: 'Claude Sonnet 4.5',
      description: 'Latest Anthropic flagship',
      vision: true,
      inputPrice: 3.00,
      outputPrice: 15.00
    },
    'claude-haiku-4.5': {
      id: 'anthropic/claude-haiku-4.5',
      name: 'Claude Haiku 4.5',
      description: 'Fast Claude 4.5',
      vision: true,
      inputPrice: 1.00,
      outputPrice: 5.00
    },
    'claude-3.5-sonnet': {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Classic Sonnet, reliable',
      vision: true,
      inputPrice: 3.00,
      outputPrice: 15.00
    },
    'claude-3-haiku': {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Budget Claude option',
      vision: true,
      inputPrice: 0.25,
      outputPrice: 1.25
    }
  },

  // === OPENAI ===
  openai: {
    'gpt-5': {
      id: 'openai/gpt-5-chat',
      name: 'GPT-5',
      description: 'OpenAI flagship',
      vision: true,
      inputPrice: 5.00,
      outputPrice: 15.00
    },
    'gpt-5-mini': {
      id: 'openai/gpt-5-mini',
      name: 'GPT-5 Mini',
      description: 'Smaller GPT-5',
      vision: true,
      inputPrice: 1.00,
      outputPrice: 3.00
    },
    'gpt-5-nano': {
      id: 'openai/gpt-5-nano',
      name: 'GPT-5 Nano',
      description: 'Tiny GPT-5',
      vision: true,
      inputPrice: 0.20,
      outputPrice: 0.60
    },
    'gpt-4o': {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'Multimodal GPT-4',
      vision: true,
      inputPrice: 2.50,
      outputPrice: 10.00
    },
    'gpt-4o-mini': {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast multimodal',
      vision: true,
      inputPrice: 0.15,
      outputPrice: 0.60
    }
  },

  // === META LLAMA ===
  meta: {
    'llama-3.2-90b-vision': {
      id: 'meta-llama/llama-3.2-90b-vision-instruct',
      name: 'Llama 3.2 90B Vision',
      description: 'Large vision model',
      vision: true,
      inputPrice: 0.90,
      outputPrice: 0.90
    }
  },

  // === BYTEDANCE ===
  bytedance: {
    'seed-1.6-flash': {
      id: 'bytedance-seed/seed-1.6-flash',
      name: 'Seed 1.6 Flash',
      description: 'Ultra-fast multimodal',
      vision: true,
      inputPrice: 0.075,
      outputPrice: 0.30
    },
    'seed-1.6': {
      id: 'bytedance-seed/seed-1.6',
      name: 'Seed 1.6',
      description: 'Deep thinking vision model',
      vision: true,
      inputPrice: 0.25,
      outputPrice: 2.00
    }
  },

  // === OTHER ===
  other: {
    'molmo2-8b': {
      id: 'allenai/molmo-2-8b:free',
      name: 'Molmo2 8B (Free)',
      description: 'Open vision model, no cost',
      vision: true,
      inputPrice: 0,
      outputPrice: 0
    }
  }
}

/**
 * Build the default Story AI system prompt with interpolated values
 * @param {Object} projectContext - Current project context
 * @returns {string} System prompt with actual values
 */
export function buildDefaultStoryPrompt(projectContext) {
  const characterList = projectContext.characters?.length > 0
    ? projectContext.characters.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n')
    : 'No characters defined yet.'

  return `You are an expert comic book writer and story assistant. You help users create compelling comic book stories with vivid dialogue, interesting plots, and memorable characters.

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
}

/**
 * Get the default prompt template (without interpolation) for editing
 * @returns {string} Template with ${...} placeholders
 */
export function getDefaultStoryPromptTemplate() {
  return `You are an expert comic book writer and story assistant. You help users create compelling comic book stories with vivid dialogue, interesting plots, and memorable characters.

## Current Project Context
- **Title:** \${projectContext.title || 'Untitled'}
- **Current Page:** \${projectContext.pageNumber || 1} of \${projectContext.totalPages || 1}

## Characters
\${characterList}

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
}

/**
 * Call OpenRouter directly for vision-capable LLM requests
 */
async function callOpenRouterVision(modelId, systemPrompt, userMessage, imageUrl, chatHistory = []) {
  if (!openRouterKey) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_KEY to your .env.local file. Get a key at https://openrouter.ai/keys')
  }

  const messages = [
    { role: 'system', content: systemPrompt }
  ]
  
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    })
  }
  
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

  console.log('[Story AI] Calling OpenRouter for vision...')
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
 * Call OpenRouter for text-only requests
 */
async function callOpenRouterText(modelId, systemPrompt, userMessage, chatHistory = []) {
  if (!openRouterKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const messages = [
    { role: 'system', content: systemPrompt }
  ]
  
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    })
  }
  
  messages.push({
    role: 'user',
    content: userMessage
  })

  console.log('[Story AI] Calling OpenRouter for text...')
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
 * @param {string} options.model - Model key (e.g., 'gemini-2.5-flash')
 * @param {string} options.provider - Provider key (e.g., 'google')
 * @param {string} options.imageUrl - URL of canvas screenshot (for vision models)
 * @param {Array<{role: string, content: string, attachedImage?: {dataUrl: string, name: string}}>} options.chatHistory - Previous messages
 * @param {Object} options.projectContext - Current project context
 *   @param {string} options.projectContext.title - Project title
 *   @param {number} options.projectContext.pageNumber - Current page number
 *   @param {number} options.projectContext.totalPages - Total pages
 *   @param {Array} options.projectContext.characters - Character list
 *   @param {string} [options.projectContext.customStoryPrompt] - Custom prompt template (optional)
 * @returns {Promise<string>} - AI response
 */
export async function chatWithStoryAI(userMessage, options = {}) {
  const { 
    model: modelKey = 'gemini-2.5-flash',
    provider: providerKey = 'google',
    imageUrl = null,
    chatHistory = [], 
    projectContext = {} 
  } = options

  if (!openRouterKey) {
    throw new Error('OpenRouter API key not configured')
  }

  // Get model config
  const providerModels = STORY_AI_MODELS[providerKey]
  if (!providerModels) {
    throw new Error(`Invalid provider: ${providerKey}`)
  }

  const modelConfig = providerModels[modelKey]
  if (!modelConfig) {
    throw new Error(`Invalid model: ${modelKey}`)
  }

  // Build system prompt (use custom prompt from series if available)
  let systemPrompt
  if (projectContext.customStoryPrompt) {
    // Use custom prompt with variable interpolation
    const characterList = projectContext.characters?.length > 0
      ? projectContext.characters.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n')
      : 'No characters defined yet.'

    systemPrompt = projectContext.customStoryPrompt
      .replace(/\$\{projectContext\.title\s*\|\|\s*['"]Untitled['"]\}/g, projectContext.title || 'Untitled')
      .replace(/\$\{projectContext\.pageNumber\s*\|\|\s*1\}/g, String(projectContext.pageNumber || 1))
      .replace(/\$\{projectContext\.totalPages\s*\|\|\s*1\}/g, String(projectContext.totalPages || 1))
      .replace(/\$\{characterList\}/g, characterList)
  } else {
    // Use default prompt
    systemPrompt = buildDefaultStoryPrompt(projectContext)
  }

  try {
    if (imageUrl && modelConfig.vision) {
      const response = await callOpenRouterVision(
        modelConfig.id,
        systemPrompt,
        userMessage,
        imageUrl,
        chatHistory
      )
      return response.trim()
    } else {
      const response = await callOpenRouterText(
        modelConfig.id,
        systemPrompt,
        userMessage,
        chatHistory
      )
      return response.trim()
    }
  } catch (error) {
    if (error.message?.includes('401')) {
      throw new Error('Invalid OpenRouter API key')
    }
    if (error.message?.includes('402')) {
      throw new Error('Insufficient OpenRouter credits')
    }
    throw new Error(`Story AI failed: ${error.message}`)
  }
}

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterConfigured() {
  return !!openRouterKey
}
