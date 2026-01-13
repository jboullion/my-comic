/**
 * Story Chat Edge Function
 * Proxies requests to OpenRouter with credit checking and deduction
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { createAdminClient, checkCredits, deductCredits, refundCredits } from '../_shared/credits.ts'

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Model ID mapping (must match frontend STORY_AI_MODELS)
const MODEL_IDS: Record<string, Record<string, string>> = {
  google: {
    'gemini-2.5-flash': 'google/gemini-2.5-flash',
    'gemini-3-flash': 'google/gemini-3-flash-preview',
    'gemini-2.5-pro': 'google/gemini-2.5-pro',
  },
  anthropic: {
    'claude-sonnet-4.5': 'anthropic/claude-sonnet-4.5',
    'claude-haiku-4.5': 'anthropic/claude-haiku-4.5',
    'claude-3-haiku': 'anthropic/claude-3-haiku',
  },
  openai: {
    'gpt-5-mini': 'openai/gpt-5-mini',
    'gpt-5-nano': 'openai/gpt-5-nano',
    'gpt-4o': 'openai/gpt-4o',
  },
  meta: {
    'llama-3.2-90b-vision': 'meta-llama/llama-3.2-90b-vision-instruct',
  },
  bytedance: {
    'seed-1.6-flash': 'bytedance-seed/seed-1.6-flash',
    'seed-1.6': 'bytedance-seed/seed-1.6',
  },
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface StoryChatRequest {
  message: string
  model?: string
  provider?: string
  imageUrl?: string | null
  chatHistory?: ChatMessage[]
  projectContext?: {
    title?: string
    pageNumber?: number
    totalPages?: number
    characters?: Array<{ name: string; description?: string }>
    customStoryPrompt?: string
  }
}

/**
 * Build the default story AI system prompt
 */
function buildSystemPrompt(projectContext: StoryChatRequest['projectContext'] = {}): string {
  const characterList = projectContext.characters?.length
    ? projectContext.characters.map(c => `- ${c.name}: ${c.description || 'No description'}`).join('\n')
    : 'No characters defined yet.'

  if (projectContext.customStoryPrompt) {
    // Use custom prompt with variable interpolation
    return projectContext.customStoryPrompt
      .replace(/\$\{projectContext\.title\s*\|\|\s*['"]Untitled['"]\}/g, projectContext.title || 'Untitled')
      .replace(/\$\{projectContext\.pageNumber\s*\|\|\s*1\}/g, String(projectContext.pageNumber || 1))
      .replace(/\$\{projectContext\.totalPages\s*\|\|\s*1\}/g, String(projectContext.totalPages || 1))
      .replace(/\$\{characterList\}/g, characterList)
  }

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

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Verify authentication
    const { userId, error: authError } = await verifyAuth(req)
    if (!userId) {
      return errorResponse(authError || 'Unauthorized', 401, 'UNAUTHORIZED')
    }

    // Parse request body
    const body: StoryChatRequest = await req.json()
    const {
      message,
      model: modelKey = 'gemini-2.5-flash',
      provider: providerKey = 'google',
      imageUrl = null,
      chatHistory = [],
      projectContext = {},
    } = body

    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required', 400, 'INVALID_REQUEST')
    }

    // Validate provider and model
    const providerModels = MODEL_IDS[providerKey]
    if (!providerModels) {
      return errorResponse(`Invalid provider: ${providerKey}`, 400, 'INVALID_PROVIDER')
    }

    const modelId = providerModels[modelKey]
    if (!modelId) {
      return errorResponse(`Invalid model: ${modelKey}`, 400, 'INVALID_MODEL')
    }

    // Create admin client for credit operations
    const adminClient = createAdminClient()

    // Check credits
    const creditCheck = await checkCredits(adminClient, userId, 'openrouter', modelKey)
    if (!creditCheck.success) {
      return errorResponse(creditCheck.error || 'Credit check failed', 402, creditCheck.errorCode)
    }

    const cost = creditCheck.cost!

    // Deduct credits before making the API call
    const deductResult = await deductCredits(
      adminClient,
      userId,
      cost,
      'ai_story',
      `Story chat: ${modelKey}`,
      { model: modelKey, provider: providerKey, messagePreview: message.substring(0, 100) }
    )

    if (!deductResult.success) {
      return errorResponse(deductResult.error || 'Failed to deduct credits', 402, 'DEDUCT_FAILED')
    }

    // Get OpenRouter API key from secrets
    const openRouterKey = Deno.env.get('OPENROUTER_KEY')
    if (!openRouterKey) {
      // Refund on configuration error
      await refundCredits(adminClient, userId, cost, 'API key not configured', { model: modelKey })
      return errorResponse('OpenRouter API key not configured', 500, 'CONFIG_ERROR')
    }

    // Build messages array
    const systemPrompt = buildSystemPrompt(projectContext)
    const messages: Array<{ role: string; content: unknown }> = [
      { role: 'system', content: systemPrompt },
    ]

    // Add chat history
    for (const msg of chatHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      })
    }

    // Add user message (with or without image)
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: message,
          },
        ],
      })
    } else {
      messages.push({
        role: 'user',
        content: message,
      })
    }

    // Call OpenRouter API
    console.log(`[story-chat] Calling OpenRouter: ${modelId}`)
    console.log(`[story-chat] User: ${userId}, Cost: ${cost}`)

    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://comicbookmaker.app',
        'X-Title': 'Comic Book Maker',
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}))
      console.error('[story-chat] OpenRouter error:', errorData)

      // Refund credits on API failure
      await refundCredits(
        adminClient,
        userId,
        cost,
        `OpenRouter error: ${errorData.error?.message || openRouterResponse.status}`,
        { model: modelKey, error: errorData }
      )

      return errorResponse(
        errorData.error?.message || `OpenRouter request failed: ${openRouterResponse.status}`,
        openRouterResponse.status === 401 ? 500 : openRouterResponse.status,
        'OPENROUTER_API_ERROR'
      )
    }

    const result = await openRouterResponse.json()
    const responseContent = result.choices?.[0]?.message?.content

    if (!responseContent) {
      // Refund if no response
      await refundCredits(adminClient, userId, cost, 'No response from OpenRouter', { model: modelKey })
      return errorResponse('No response generated', 500, 'NO_RESPONSE')
    }

    // Return success with response
    return jsonResponse({
      success: true,
      response: responseContent.trim(),
      model: modelKey,
      provider: providerKey,
      credits: {
        cost,
        newBalance: deductResult.newBalance,
      },
    })
  } catch (error) {
    console.error('[story-chat] Unexpected error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unexpected error',
      500,
      'UNEXPECTED_ERROR'
    )
  }
})
