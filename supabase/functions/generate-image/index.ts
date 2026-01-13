/**
 * Generate Image Edge Function
 * Proxies requests to Fal.ai with credit checking and deduction
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { verifyAuth } from '../_shared/auth.ts'
import { createAdminClient, checkCredits, deductCredits } from '../_shared/credits.ts'
import {
  checkImageGenStatus,
  checkPromptContent,
  recordImageViolation,
  isFalContentPolicyError
} from '../_shared/moderation.ts'

// Fal.ai API configuration
const FAL_QUEUE_URL = 'https://queue.fal.run'

// Polling configuration
const POLL_INTERVAL_MS = 1000 // 1 second
const MAX_POLL_TIME_MS = 120000 // 2 minutes max

// Helper to poll for queue result
async function pollForResult(
  modelId: string,
  requestId: string,
  apiKey: string
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const startTime = Date.now()
  const statusUrl = `${FAL_QUEUE_URL}/${modelId}/requests/${requestId}/status`
  const resultUrl = `${FAL_QUEUE_URL}/${modelId}/requests/${requestId}`

  while (Date.now() - startTime < MAX_POLL_TIME_MS) {
    // Check status
    const statusResponse = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${apiKey}` },
    })

    if (!statusResponse.ok) {
      return { data: null, error: `Status check failed: ${statusResponse.status}` }
    }

    const status = await statusResponse.json()
    console.log(`[generate-image] Queue status: ${status.status}`)

    if (status.status === 'COMPLETED') {
      // Fetch the result
      const resultResponse = await fetch(resultUrl, {
        headers: { 'Authorization': `Key ${apiKey}` },
      })

      if (!resultResponse.ok) {
        return { data: null, error: `Result fetch failed: ${resultResponse.status}` }
      }

      const result = await resultResponse.json()
      return { data: result, error: null }
    }

    if (status.status === 'FAILED') {
      return { data: null, error: status.error || 'Generation failed' }
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  return { data: null, error: 'Generation timed out' }
}

// Model ID mapping (matches frontend)
const MODEL_IDS: Record<string, string> = {
  'flux-2-pro': 'fal-ai/flux-2-pro',
  'flux-2': 'fal-ai/flux-2',
  'nano-banana': 'fal-ai/nano-banana-pro',
  'custom': 'fal-ai/flux-lora', // Default for custom models
}

interface GenerateRequest {
  prompt: string
  style?: string
  model?: string
  imageSize?: string | { width: number; height: number }
  seed?: number | null
  allowMature?: boolean
  lora?: {
    url: string
    scale?: number
    triggerWord?: string
  } | null
  customModel?: {
    url: string
    type: string
    name: string
  } | null
  guidanceScale?: number | null
  inferenceSteps?: number | null
  negativePrompt?: string | null
}

// Style suffixes (must match frontend)
const STYLE_SUFFIXES: Record<string, string> = {
  none: '',
  comic: ', comic book style, bold ink lines, cel-shaded, vibrant colors, dynamic composition',
  manga: ', manga style, black and white, screentone shading, expressive eyes, Japanese comic art',
  realistic: ', photorealistic, highly detailed, professional photography, sharp focus',
  retro: ', vintage comic book style, halftone dots, 1960s pop art, bold primary colors',
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
    const body: GenerateRequest = await req.json()
    const {
      prompt,
      style = 'comic',
      model: modelKey = 'flux-2',
      imageSize = 'square_hd',
      seed = null,
      allowMature = true, // Default to true for better image quality
      lora = null,
      customModel = null,
      guidanceScale = null,
      inferenceSteps = null,
      negativePrompt = null,
    } = body

    if (!prompt || prompt.trim().length === 0) {
      return errorResponse('Prompt is required', 400, 'INVALID_REQUEST')
    }

    // Create admin client for credit operations
    const adminClient = createAdminClient()

    // 1. Check if user is restricted from image generation
    const imageGenStatus = await checkImageGenStatus(adminClient, userId)
    if (!imageGenStatus.canGenerate) {
      return errorResponse(
        imageGenStatus.message || 'Image generation is temporarily unavailable for your account.',
        403,
        'IMAGE_GEN_RESTRICTED'
      )
    }

    // 2. Pre-screen prompt against content filters
    const filterResult = await checkPromptContent(adminClient, prompt)
    if (!filterResult.passed) {
      // Record violation (fire and forget for speed)
      recordImageViolation(adminClient, userId, 'pre_filter', prompt, {
        category: filterResult.category,
        severity: filterResult.severity,
        metadata: { model: modelKey, style },
      })

      return errorResponse(
        "Your prompt couldn't be processed. Please revise and try again.",
        400,
        'CONTENT_POLICY_VIOLATION'
      )
    }

    // 3. Check credits (but don't deduct yet - only deduct after successful generation)
    const creditCheck = await checkCredits(adminClient, userId, 'fal', modelKey)
    if (!creditCheck.success) {
      return errorResponse(creditCheck.error || 'Credit check failed', 402, creditCheck.errorCode)
    }

    const cost = creditCheck.cost!

    // Get Fal.ai API key from secrets
    const falApiKey = Deno.env.get('FAL_AI_KEY')
    if (!falApiKey) {
      return errorResponse('Fal.ai API key not configured', 500, 'CONFIG_ERROR')
    }

    // Determine model ID
    const useCustomModel = modelKey === 'custom' && customModel?.url
    const useLora = lora?.url !== null && lora?.url !== undefined
    let modelId: string

    if (useCustomModel) {
      modelId = customModel!.type === 'flux' ? 'fal-ai/flux-lora' : 'fal-ai/lora'
    } else if (useLora) {
      modelId = 'fal-ai/flux-lora'
    } else {
      modelId = MODEL_IDS[modelKey] || MODEL_IDS['flux-2']
    }

    // Build prompt with style and trigger word
    let finalPrompt = prompt
    if (lora?.triggerWord) {
      finalPrompt = `${lora.triggerWord}, ${prompt}`
    }
    const styleSuffix = STYLE_SUFFIXES[style] || ''
    const fullPrompt = finalPrompt + styleSuffix

    // Build Fal.ai input
    const input: Record<string, unknown> = {
      prompt: fullPrompt,
      num_images: 1,
      output_format: 'png',
    }

    // Handle image size
    if (modelKey === 'nano-banana') {
      // Nano Banana uses aspect ratio
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
        const presetMap: Record<string, string> = {
          'square_hd': '1:1',
          'square': '1:1',
          'portrait_4_3': '3:4',
          'portrait_16_9': '9:16',
          'landscape_4_3': '4:3',
          'landscape_16_9': '16:9',
        }
        aspectRatio = presetMap[imageSize] || '1:1'
      }
      input.aspect_ratio = aspectRatio
    } else {
      input.image_size = imageSize
    }

    // Custom model settings
    if (useCustomModel && customModel!.type !== 'flux') {
      input.model_name = customModel!.url
      input.scheduler = 'DPM++ 2M Karras'
    }

    // Guidance scale
    if (guidanceScale !== null) {
      input.guidance_scale = guidanceScale
    } else if (useCustomModel && customModel!.type !== 'flux') {
      input.guidance_scale = 7.5
    }

    // Negative prompt
    if (negativePrompt && negativePrompt.trim()) {
      input.negative_prompt = negativePrompt
    } else if (useCustomModel && customModel!.type !== 'flux') {
      input.negative_prompt = 'blurry, low quality, distorted, deformed, ugly, bad anatomy'
    }

    // Inference steps
    if (inferenceSteps !== null) {
      input.num_inference_steps = inferenceSteps
    } else if (modelKey !== 'nano-banana') {
      if (useCustomModel && customModel!.type !== 'flux') {
        input.num_inference_steps = 30
      } else if (useCustomModel || useLora) {
        input.num_inference_steps = 28
      } else if (modelKey === 'flux-2') {
        input.num_inference_steps = 28
      }
    }

    // Safety settings
    if (allowMature) {
      if (modelKey === 'flux-2-pro' && !useCustomModel) {
        input.safety_tolerance = '5'
      } else {
        input.enable_safety_checker = false
      }
    }

    // Seed
    if (seed !== null) {
      input.seed = seed
    }

    // LoRA settings
    if (useLora) {
      input.loras = [{
        path: lora!.url,
        scale: lora!.scale ?? 0.8,
      }]
    }

    // Submit to Fal.ai queue
    console.log(`[generate-image] Submitting to Fal.ai queue: ${modelId}`)
    console.log(`[generate-image] User: ${userId}, Cost: ${cost}`)

    const queueResponse = await fetch(`${FAL_QUEUE_URL}/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!queueResponse.ok) {
      const errorData = await queueResponse.json().catch(() => ({}))
      console.error('[generate-image] Fal.ai queue error:', errorData)

      // Check if this is a content policy rejection (422)
      if (isFalContentPolicyError(queueResponse.status, errorData)) {
        // Record violation
        await recordImageViolation(adminClient, userId, 'fal_rejection', prompt, {
          severity: 2,
          errorDetail: errorData.detail || 'Content policy violation',
          metadata: { model: modelKey, style, falStatus: queueResponse.status },
        })

        return errorResponse(
          "Your prompt couldn't be processed. Please revise and try again.",
          400,
          'CONTENT_POLICY_VIOLATION'
        )
      }

      return errorResponse(
        errorData.detail || `Fal.ai request failed: ${queueResponse.status}`,
        queueResponse.status === 401 ? 500 : queueResponse.status,
        'FAL_API_ERROR'
      )
    }

    const queueResult = await queueResponse.json()
    const requestId = queueResult.request_id

    if (!requestId) {
      return errorResponse('Failed to queue image generation', 500, 'QUEUE_ERROR')
    }

    console.log(`[generate-image] Queued with request_id: ${requestId}`)

    // Poll for result
    const { data: result, error: pollError } = await pollForResult(modelId, requestId, falApiKey)

    if (pollError || !result) {
      return errorResponse(pollError || 'Image generation failed', 500, 'GENERATION_FAILED')
    }

    const image = (result.images as Array<{ url: string; width: number; height: number }>)?.[0]

    if (!image) {
      return errorResponse('No image generated', 500, 'NO_IMAGE')
    }

    // SUCCESS! Now deduct credits (only after successful generation)
    const deductResult = await deductCredits(
      adminClient,
      userId,
      cost,
      'ai_image',
      `Image generation: ${modelKey}`,
      { model: modelKey, promptPreview: prompt.substring(0, 100) }
    )

    if (!deductResult.success) {
      // This shouldn't happen since we checked credits earlier, but handle it gracefully
      console.error('[generate-image] Failed to deduct credits after successful generation:', deductResult.error)
    }

    // Return success with image data
    return jsonResponse({
      success: true,
      imageUrl: image.url,
      width: image.width,
      height: image.height,
      seed: result.seed,
      prompt: prompt,
      fullPrompt: fullPrompt,
      model: modelKey,
      customModelName: useCustomModel ? customModel!.name : null,
      usedLora: useLora,
      usedCustomModel: useCustomModel,
      credits: {
        cost,
        newBalance: deductResult.newBalance ?? (creditCheck.balance! - cost),
      },
    })
  } catch (error) {
    console.error('[generate-image] Unexpected error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unexpected error',
      500,
      'UNEXPECTED_ERROR'
    )
  }
})
