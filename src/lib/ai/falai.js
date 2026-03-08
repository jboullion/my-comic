/**
 * Fal.ai Constants for Image Generation
 * Model definitions, style presets, and related constants.
 * Actual API calls go through Supabase Edge Functions (see edgeFunctions.ts).
 */

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
    cost: '8 credits',
    generation: 2
  },
  'flux-2': {
    id: 'fal-ai/flux-2',
    name: 'FLUX 2 Dev',
    description: 'Great quality, faster',
    steps: 28,
    cost: '5 credits',
    generation: 2
  },
  'nano-banana': {
    id: 'fal-ai/nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'Fast, budget-friendly',
    steps: null,
    cost: '2 credit',
    generation: 2,
    usesAspectRatio: true
  }
}

