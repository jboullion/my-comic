/**
 * Enhance Prompt Edge Function
 * Proxies prompt enhancement requests to OpenRouter with credit checking
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { createAdminClient, checkCredits, deductCredits, refundCredits } from '../_shared/credits.ts'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const ENHANCE_MODEL_ID = 'google/gemini-3-flash-preview'

interface EnhanceRequest {
  prompt: string
  characters?: Array<{ name: string; description?: string }>
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
    const body: EnhanceRequest = await req.json()
    const { prompt, characters = [] } = body

    if (!prompt || prompt.trim().length === 0) {
      return errorResponse('Prompt is required', 400, 'INVALID_REQUEST')
    }

    // Create admin client for credit operations
    const adminClient = createAdminClient()

    // Check credits (uses 'enhance-prompt' model key)
    const creditCheck = await checkCredits(adminClient, userId, 'openrouter', 'enhance-prompt')
    if (!creditCheck.success) {
      return errorResponse(creditCheck.error || 'Credit check failed', 402, creditCheck.errorCode)
    }

    const cost = creditCheck.cost!

    // Deduct credits before making the API call
    const deductResult = await deductCredits(
      adminClient,
      userId,
      cost,
      'ai_enhance',
      'Prompt enhancement',
      { promptPreview: prompt.substring(0, 100) }
    )

    if (!deductResult.success) {
      return errorResponse(deductResult.error || 'Failed to deduct credits', 402, 'DEDUCT_FAILED')
    }

    // Get OpenRouter API key from secrets
    const openRouterKey = Deno.env.get('OPENROUTER_KEY')
    if (!openRouterKey) {
      await refundCredits(adminClient, userId, cost, 'API key not configured', {})
      return errorResponse('OpenRouter API key not configured', 500, 'CONFIG_ERROR')
    }

    // Build character context
    const characterContext = characters.length > 0
      ? `\nCharacters that may appear: ${characters.map(c => `${c.name} (${c.description || 'no description'})`).join(', ')}`
      : ''

    const systemPrompt = `You are a technical prompt engineer for FLUX image generation models.
Transform the user's basic prompt into a structured, technical prompt optimized for AI image generation.

Use this exact format: [Subject description], [pose/expression], [lighting], [background]

Guidelines:
- Subject description: Physical details, clothing, distinguishing features
- Pose/expression: Body position, facial expression, action
- Lighting: Light source direction, quality (soft/hard), color temperature
- Background: Setting, environment, depth of field${characterContext}

Rules:
- Write exactly 30-80 words total
- Use comma-separated technical descriptors
- Be precise and literal, avoid flowery language
- Do NOT add style modifiers (they are added separately)
- Do NOT include negative prompts
- Preserve the user's original subject and intent

Return ONLY the enhanced prompt, no explanations.`

    // Call OpenRouter API
    console.log(`[enhance-prompt] Calling OpenRouter for prompt enhancement`)
    console.log(`[enhance-prompt] User: ${userId}, Cost: ${cost}`)

    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://comicbookmaker.app',
        'X-Title': 'Comic Book Maker',
      },
      body: JSON.stringify({
        model: ENHANCE_MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User's basic prompt: "${prompt}"\n\nExpand this into a detailed image generation prompt:` },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}))
      console.error('[enhance-prompt] OpenRouter error:', errorData)

      await refundCredits(
        adminClient,
        userId,
        cost,
        `OpenRouter error: ${errorData.error?.message || openRouterResponse.status}`,
        { error: errorData }
      )

      return errorResponse(
        errorData.error?.message || `OpenRouter request failed: ${openRouterResponse.status}`,
        openRouterResponse.status === 401 ? 500 : openRouterResponse.status,
        'OPENROUTER_API_ERROR'
      )
    }

    const result = await openRouterResponse.json()
    const enhanced = result.choices?.[0]?.message?.content

    if (!enhanced) {
      await refundCredits(adminClient, userId, cost, 'No response from OpenRouter', {})
      return errorResponse('No enhanced prompt generated', 500, 'NO_RESPONSE')
    }

    // Return success with enhanced prompt
    return jsonResponse({
      success: true,
      enhancedPrompt: enhanced.trim(),
      credits: {
        cost,
        newBalance: deductResult.newBalance,
      },
    })
  } catch (error) {
    console.error('[enhance-prompt] Unexpected error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unexpected error',
      500,
      'UNEXPECTED_ERROR'
    )
  }
})
