import { useState, useMemo, useCallback } from 'react'
import useProjectStore from '../stores/useProjectStore'
import useSeriesStore from '../stores/useSeriesStore'

/**
 * Calculate AI-friendly dimensions that match a given aspect ratio
 */
function calculateMatchingDimensions(
  pageWidth: number,
  pageHeight: number,
  maxDimension = 1152
): { width: number; height: number } {
  const aspectRatio = pageWidth / pageHeight

  let width: number
  let height: number

  if (aspectRatio > 1) {
    width = maxDimension
    height = Math.round(maxDimension / aspectRatio)
  } else {
    height = maxDimension
    width = Math.round(maxDimension * aspectRatio)
  }

  // Round to nearest multiple of 64 for optimal AI generation
  width = Math.round(width / 64) * 64
  height = Math.round(height / 64) * 64

  // Ensure minimum dimension of 256
  width = Math.max(256, width)
  height = Math.max(256, height)

  return { width, height }
}

export interface AdvancedPrompts {
  scene: string
  character: string
  lighting: string
  composition: string
}

export interface AdvancedParams {
  guidanceScale: number
  inferenceSteps: number
  negativePrompt: string
  seed: number | null
}

export interface GeneratedImage {
  imageUrl: string
  width: number
  height: number
  model: string
  style: string
  seed: number
  usedCustomModel?: boolean
  customModelName?: string
}

export interface GenerationProgress {
  status: 'PENDING' | 'UPLOADING' | 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED'
  position?: number
  logs?: string[]
}

const IMAGE_SIZE_OPTIONS = [
  { value: 'match_page', label: 'Match Page', description: 'Match Page' },
  { value: 'square_hd', label: '1024x1024', description: 'Square HD' },
  { value: 'portrait_4_3', label: '768x1024', description: 'Portrait 3:4' },
  { value: 'portrait_16_9', label: '576x1024', description: 'Portrait 9:16' },
  { value: 'landscape_4_3', label: '1024x768', description: 'Landscape 4:3' },
  { value: 'landscape_16_9', label: '1024x576', description: 'Landscape 16:9' },
]

interface UseAIImageFormOptions {
  projectId: string | undefined
}

/**
 * Hook that manages all form state for the AI Image Modal
 */
export function useAIImageForm({ projectId }: UseAIImageFormOptions) {
  // Get current project settings for "Match Page" option
  const { currentProject } = useProjectStore()
  const pageSettings = currentProject?.settings || { width: 800, height: 1200 }

  // Get custom model from series
  const { getSeriesCustomModel } = useSeriesStore()
  const customModel = currentProject?.seriesId
    ? getSeriesCustomModel(currentProject.seriesId)
    : null

  // Calculate matching dimensions for "Match Page" option
  const matchPageDimensions = useMemo(
    () => calculateMatchingDimensions(pageSettings.width, pageSettings.height),
    [pageSettings.width, pageSettings.height]
  )

  // Tab state
  const [activeTab, setActiveTab] = useState<'generate' | 'advanced' | 'history'>('generate')

  // Generate tab state
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('comic')
  const [model, setModel] = useState('flux-2')
  const [imageSize, setImageSize] = useState('match_page')
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([])

  // Advanced tab state
  const [advancedPrompts, setAdvancedPrompts] = useState<AdvancedPrompts>({
    scene: '',
    character: '',
    lighting: '',
    composition: ''
  })
  const [advancedStyle, setAdvancedStyle] = useState('')
  const [advancedParams, setAdvancedParams] = useState<AdvancedParams>({
    guidanceScale: 7.5,
    inferenceSteps: 28,
    negativePrompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
    seed: null
  })

  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Combine structured prompts for advanced tab
  const combineStructuredPrompts = useCallback(() => {
    const parts: string[] = []

    if (advancedPrompts.character) parts.push(advancedPrompts.character)
    if (advancedPrompts.scene) parts.push(advancedPrompts.scene)
    if (advancedPrompts.lighting) parts.push(advancedPrompts.lighting)
    if (advancedPrompts.composition) parts.push(advancedPrompts.composition)
    if (advancedStyle) parts.push(advancedStyle)

    return parts.filter(p => p.trim()).join(', ')
  }, [advancedPrompts, advancedStyle])

  // Reset all state
  const resetAllState = useCallback(() => {
    setPrompt('')
    setGeneratedImage(null)
    setError(null)
    setProgress(null)
    setActiveTab('generate')
    setSelectedCharacterIds([])
  }, [])

  // Get the actual image size dimensions
  const getImageSizeParam = useCallback(() => {
    return imageSize === 'match_page' ? matchPageDimensions : imageSize
  }, [imageSize, matchPageDimensions])

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Generate tab state
    prompt,
    setPrompt,
    style,
    setStyle,
    model,
    setModel,
    imageSize,
    setImageSize,
    selectedCharacterIds,
    setSelectedCharacterIds,

    // Advanced tab state
    advancedPrompts,
    setAdvancedPrompts,
    advancedStyle,
    setAdvancedStyle,
    advancedParams,
    setAdvancedParams,

    // UI state
    isGenerating,
    setIsGenerating,
    generatedImage,
    setGeneratedImage,
    error,
    setError,
    progress,
    setProgress,
    isSaving,
    setIsSaving,

    // Computed values
    matchPageDimensions,
    customModel,
    imageSizeOptions: IMAGE_SIZE_OPTIONS,

    // Utility functions
    combineStructuredPrompts,
    resetAllState,
    getImageSizeParam,
  }
}
