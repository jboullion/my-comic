import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FiX, FiZap, FiRefreshCw, FiCheck, FiAlertCircle, FiCpu, FiClock, FiLoader } from 'react-icons/fi'
import { AI_MODELS, AI_STYLES } from '../../lib/ai/falai'
import { generateImageViaEdge, enhancePromptViaEdge, getImageGenerationCost } from '../../lib/ai/edgeFunctions'
import { fetchImageAsBlob } from '../../lib/ai/utils'
import { generationHistoryDb, fetchImageAsWebP } from '../../lib/generationHistory'
import { useGenerationHistory } from '../../hooks/useGenerationHistory'
import HistoryGallery from './HistoryGallery'
import CharacterPicker from './CharacterPicker'
import useCharactersStore from '../../stores/useCharactersStore'
import useProjectStore from '../../stores/useProjectStore'
import useSeriesStore from '../../stores/useSeriesStore'
import { useCredits } from '../../hooks/useCredits'
import { useIsImageGenRestricted, useImageGenLockoutMessage } from '../../stores/useCreditsStore'
import CreditCostPreview from '../credits/CreditCostPreview'

/**
 * Calculate AI-friendly dimensions that match a given aspect ratio
 * @param {number} pageWidth - Original page width
 * @param {number} pageHeight - Original page height
 * @param {number} maxDimension - Maximum dimension (default 1152)
 * @returns {{ width: number, height: number }} - Dimensions divisible by 64
 */
function calculateMatchingDimensions(pageWidth, pageHeight, maxDimension = 1152) {
  const aspectRatio = pageWidth / pageHeight

  let width, height

  if (aspectRatio > 1) {
    // Landscape: width is the constraining dimension
    width = maxDimension
    height = Math.round(maxDimension / aspectRatio)
  } else {
    // Portrait or square: height is the constraining dimension
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

// Migration: Clean up old localStorage history (one-time)
const migrateOldHistory = (projectId) => {
  if (!projectId) return
  const oldKey = `ai-history:${projectId}`
  if (localStorage.getItem(oldKey)) {
    localStorage.removeItem(oldKey)
    console.info('Migrated AI history to IndexedDB (old entries discarded)')
  }
}

/**
 * AIImageModal Component
 * Modal for generating AI images using Fal.ai FLUX models
 */
export default function AIImageModal({ isOpen, onClose, onSave }) {
  const { projectId } = useParams()

  // Get credits info for cost preview and auth check
  const { balance, isLoggedIn, hasCredits } = useCredits()

  // Check if user is restricted from image generation
  const isImageGenRestricted = useIsImageGenRestricted()
  const lockoutMessage = useImageGenLockoutMessage()

  // Get current project settings for "Match Page" option
  const { currentProject } = useProjectStore()
  const pageSettings = currentProject?.settings || { width: 800, height: 1200 }

  // Get custom model from series (not project)
  const { getSeriesCustomModel } = useSeriesStore()
  const customModel = currentProject?.seriesId ? getSeriesCustomModel(currentProject.seriesId) : null

  // Calculate matching dimensions for "Match Page" option
  const matchPageDimensions = useMemo(() => {
    return calculateMatchingDimensions(pageSettings.width, pageSettings.height)
  }, [pageSettings.width, pageSettings.height])

  // Tab state
  const [activeTab, setActiveTab] = useState('generate')

  // Form state
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('comic')
  const [model, setModel] = useState('flux-2')
  const [imageSize, setImageSize] = useState('match_page')
  const [selectedCharacterIds, setSelectedCharacterIds] = useState([])

  // Advanced tab structured prompts
  const [advancedPrompts, setAdvancedPrompts] = useState({
    scene: '',
    character: '',
    lighting: '',
    composition: ''
  })

  // Advanced tab style (free text instead of dropdown)
  const [advancedStyle, setAdvancedStyle] = useState('')

  // Advanced parameters
  const [advancedParams, setAdvancedParams] = useState({
    guidanceScale: 7.5,  // CFG scale (1-20)
    inferenceSteps: 28,  // Steps (15-50)
    negativePrompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
    seed: null
  })

  // Always allow mature content (safety filters disabled for better image quality)
  // A proper content filter UI will be implemented later
  const allowMature = true

  // Get characters from store for prompt building
  const { characters } = useCharactersStore()

  // Get LoRA from first selected character that has one configured
  const getCharacterLora = useCallback(() => {
    if (selectedCharacterIds.length === 0) return null

    // Find first selected character with a LoRA configured
    for (const id of selectedCharacterIds) {
      const char = characters.find(c => c.id === id)
      if (char?.loraUrl) {
        return {
          url: char.loraUrl,
          triggerWord: char.loraTriggerWord || '',
          scale: char.loraScale ?? 0.8,
          characterName: char.name
        }
      }
    }
    return null
  }, [selectedCharacterIds, characters])

  // Check if we have a LoRA available (for UI indicator)
  // const characterLora = getCharacterLora()
  // const hasLora = characterLora !== null

  // Check if current model supports LoRA (only custom models support LoRA, not FLUX)
  // const modelSupportsLora = model === 'custom'

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // Prompt enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [wasEnhanced, setWasEnhanced] = useState(false)

  // History with IndexedDB (replaces localStorage)
  const {
    entries: history,
    isLoading: isHistoryLoading,
    hasMore: hasMoreHistory,
    totalCount: historyTotalCount,
    loadMore: loadMoreHistory,
    togglePin: toggleHistoryPin,
    deleteEntry: deleteHistoryEntry,
    clearAll: clearHistory,
    refresh: refreshHistory
  } = useGenerationHistory({
    projectId: projectId ? Number(projectId) : null,
    pageSize: 20
  })

  // Migrate old localStorage history on first open
  useEffect(() => {
    if (isOpen && projectId) {
      migrateOldHistory(projectId)
    }
  }, [isOpen, projectId])

  // Auto-fill character description in advanced tab
  useEffect(() => {
    if (activeTab !== 'advanced') return
    if (selectedCharacterIds.length === 0) return

    const selectedChar = characters.find(c => selectedCharacterIds.includes(c.id))
    if (selectedChar?.description) {
      setAdvancedPrompts(prev => ({
        ...prev,
        character: selectedChar.description
      }))
    }
  }, [selectedCharacterIds, activeTab, characters])

  const imageSizeOptions = [
    { value: 'square_hd', label: '1024x1024', description: 'Square HD' },
    { value: 'portrait_4_3', label: '768x1024', description: 'Portrait 3:4' },
    { value: 'portrait_16_9', label: '576x1024', description: 'Portrait 9:16' },
    { value: 'landscape_4_3', label: '1024x768', description: 'Landscape 4:3' },
    { value: 'landscape_16_9', label: '1024x576', description: 'Landscape 16:9' },
  ]

  // Build prompt with character descriptions (no longer auto-appends)
  const buildPromptWithCharacters = useCallback((basePrompt) => {
    // Character descriptions are only for reference in CharacterPicker preview
    return basePrompt
  }, [])

  // Combine structured prompts for advanced tab
  const combineStructuredPrompts = useCallback(() => {
    const parts = []

    if (advancedPrompts.character) parts.push(advancedPrompts.character)
    if (advancedPrompts.scene) parts.push(advancedPrompts.scene)
    if (advancedPrompts.lighting) parts.push(advancedPrompts.lighting)
    if (advancedPrompts.composition) parts.push(advancedPrompts.composition)
    if (advancedStyle) parts.push(advancedStyle)

    return parts.filter(p => p.trim()).join(', ')
  }, [advancedPrompts, advancedStyle])

  // Handle prompt enhancement with AI
  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim() || isEnhancing) return

    setIsEnhancing(true)
    setOriginalPrompt(prompt.trim())
    setError(null)

    try {
      // Get selected character info for context
      const selectedChars = characters
        .filter(c => selectedCharacterIds.includes(c.id))
        .map(c => ({ name: c.name, description: c.description || '' }))

      const result = await enhancePromptViaEdge({
        prompt: prompt.trim(),
        characters: selectedChars
      })

      setPrompt(result.enhancedPrompt)
      setWasEnhanced(true)
    } catch (err) {
      setError(`Enhancement failed: ${err.message}`)
    } finally {
      setIsEnhancing(false)
    }
  }, [prompt, isEnhancing, characters, selectedCharacterIds])

  // Handle reverting to original prompt
  const handleRevertPrompt = useCallback(() => {
    if (originalPrompt) {
      setPrompt(originalPrompt)
      setWasEnhanced(false)
      setOriginalPrompt('')
    }
  }, [originalPrompt])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    // Check credits before generating
    const cost = getImageGenerationCost(model)
    if (!hasCredits(cost)) {
      setError(`Not enough credits. This generation costs ${cost} credits, but you only have ${balance ?? 0}.`)
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(null)

    try {
      // Build prompt - only prepend character description if prompt wasn't already enhanced
      // (enhancement already incorporates character context)
      const fullPrompt = wasEnhanced
        ? prompt.trim()
        : buildPromptWithCharacters(prompt.trim())

      // Get LoRA from selected character (only for custom models - FLUX doesn't support LoRAs)
      const lora = model === 'custom' ? getCharacterLora() : null

      // Use custom dimensions for "match_page", otherwise use preset string
      const imageSizeParam = imageSize === 'match_page'
        ? matchPageDimensions
        : imageSize

      const result = await generateImageViaEdge({
        prompt: fullPrompt,
        style,
        model,
        imageSize: imageSizeParam,
        allowMature,
        lora,
        customModel: model === 'custom' ? customModel : null,
        onProgress: setProgress
      })

      setGeneratedImage({ ...result, style })

      // Save to history with full image
      try {
        const { blob: imageBlob, width: imageWidth, height: imageHeight } =
          await fetchImageAsWebP(result.imageUrl)

        await generationHistoryDb.add({
          projectId: Number(projectId),
          timestamp: Date.now(),
          pinned: false,
          prompt: prompt.trim(),
          style,
          model,
          imageSize,
          imageBlob,
          imageWidth,
          imageHeight
        })

        // Prune to 100 items and refresh the list
        await generationHistoryDb.pruneToLimit(Number(projectId), 100)
        refreshHistory()
      } catch (historyErr) {
        console.error('Failed to save to history:', historyErr)
        // Don't fail the generation if history save fails
      }
    } catch (err) {
      setError(err.message)
      setGeneratedImage(null)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [prompt, style, model, imageSize, projectId, buildPromptWithCharacters, getCharacterLora, allowMature, matchPageDimensions, customModel, wasEnhanced, hasCredits, balance, refreshHistory])

  const handleAdvancedGenerate = useCallback(async () => {
    const combinedPrompt = combineStructuredPrompts()

    if (!combinedPrompt.trim()) {
      setError('Please fill in at least one prompt field')
      return
    }

    // Check credits before generating
    const cost = getImageGenerationCost(model)
    if (!hasCredits(cost)) {
      setError(`Not enough credits. This generation costs ${cost} credits, but you only have ${balance ?? 0}.`)
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(null)

    try {
      // Get LoRA from selected character (only for custom models - FLUX doesn't support LoRAs)
      const lora = model === 'custom' ? getCharacterLora() : null

      // Use custom dimensions for "match_page", otherwise use preset string
      const imageSizeParam = imageSize === 'match_page'
        ? matchPageDimensions
        : imageSize

      const result = await generateImageViaEdge({
        prompt: combinedPrompt,
        style: 'none', // Style is included in the text prompt for advanced tab
        model,
        imageSize: imageSizeParam,
        seed: advancedParams.seed,
        allowMature,
        lora,
        customModel: model === 'custom' ? customModel : null,
        // Advanced parameters
        guidanceScale: advancedParams.guidanceScale,
        inferenceSteps: advancedParams.inferenceSteps,
        negativePrompt: advancedParams.negativePrompt,
        onProgress: setProgress
      })

      setGeneratedImage({ ...result, style: advancedStyle })

      // Save to history with full image and structured prompts
      try {
        const { blob: imageBlob, width: imageWidth, height: imageHeight } =
          await fetchImageAsWebP(result.imageUrl)

        await generationHistoryDb.add({
          projectId: Number(projectId),
          timestamp: Date.now(),
          pinned: false,
          prompt: combinedPrompt,
          style: null, // Advanced tab uses advancedStyle instead
          model,
          imageSize,
          structuredPrompts: advancedPrompts,
          advancedStyle,
          advancedParams,
          imageBlob,
          imageWidth,
          imageHeight
        })

        // Prune to 100 items and refresh the list
        await generationHistoryDb.pruneToLimit(Number(projectId), 100)
        refreshHistory()
      } catch (historyErr) {
        console.error('Failed to save to history:', historyErr)
        // Don't fail the generation if history save fails
      }
    } catch (err) {
      setError(err.message)
      setGeneratedImage(null)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [combineStructuredPrompts, advancedStyle, model, imageSize, projectId, getCharacterLora, allowMature, matchPageDimensions, customModel, advancedPrompts, advancedParams, hasCredits, balance, refreshHistory])

  const handleSave = useCallback(async () => {
    if (!generatedImage?.imageUrl) return

    setIsSaving(true)
    setError(null)

    try {
      // Fetch image as blob
      const blob = await fetchImageAsBlob(generatedImage.imageUrl)

      // Create a File object (addImage expects a File)
      const fileName = `ai-generated-${Date.now()}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      // Create metadata for the asset
      const metadata = {
        prompt: prompt.trim(),
        model: generatedImage.model,
        style: generatedImage.style,
        seed: generatedImage.seed
      }

      // Call parent save handler with metadata
      await onSave(file, metadata)

      // Reset state and close modal on success
      setPrompt('')
      setGeneratedImage(null)
      setError(null)
      setProgress(null)
      onClose()
    } catch (err) {
      setError(`Failed to save image: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }, [generatedImage, prompt, onSave, onClose])

  const handleClose = useCallback(() => {
    setPrompt('')
    setGeneratedImage(null)
    setError(null)
    setProgress(null)
    setActiveTab('generate')
    setSelectedCharacterIds([])
    setWasEnhanced(false)
    setOriginalPrompt('')
    onClose()
  }, [onClose])

  const handleHistoryClick = useCallback((entry) => {
    // Check if this is an advanced tab entry with structured prompts
    if (entry.structuredPrompts) {
      setAdvancedPrompts(entry.structuredPrompts)
      setAdvancedStyle(entry.advancedStyle || '')
      setActiveTab('advanced')
      if (entry.advancedParams) {
        setAdvancedParams(entry.advancedParams)
      }
    } else {
      setPrompt(entry.prompt)
      setStyle(entry.style || 'comic')
      setActiveTab('generate')
    }

    if (entry.model) {
      setModel(entry.model)
    }
    if (entry.imageSize) {
      setImageSize(entry.imageSize)
    }
  }, [])

  if (!isOpen) return null

  // Check if user is logged in (Edge Functions require authentication)
  const isConfigured = isLoggedIn

  // Get current model cost for preview
  const currentCost = getImageGenerationCost(model)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FiCpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">AI Image Generator</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {isConfigured && (
          <div className="flex border-b border-slate-700 px-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'generate'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              <FiZap className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'advanced'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              <FiCpu className="w-4 h-4" />
              Advanced
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'history'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              <FiClock className="w-4 h-4" />
              History
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isConfigured ? (
            /* Not Signed In Warning */
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">Sign In Required</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    Please sign in to use AI image generation. Your account includes free credits each month.
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'generate' ? (
            /* Generate Tab */
            <>
              {/* Image Generation Lockout Banner */}
              {isImageGenRestricted && lockoutMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Image Generation Restricted</p>
                      <p className="text-xs text-red-300/70 mt-1">{lockoutMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Prompt</label>
                  {wasEnhanced && (
                    <button
                      onClick={handleRevertPrompt}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <FiRefreshCw className="w-3 h-3" />
                      Revert to original
                    </button>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value)
                      // Clear enhanced state if user manually edits
                      if (wasEnhanced) {
                        setWasEnhanced(false)
                        setOriginalPrompt('')
                      }
                    }}
                    placeholder="Describe the image you want to generate..."
                    rows={4}
                    disabled={isGenerating || isEnhancing}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none disabled:opacity-50"
                  />
                  {/* AI Enhance Button */}
                  <button
                    onClick={handleEnhancePrompt}
                    disabled={!prompt.trim() || isEnhancing || isGenerating}
                    title="Enhance prompt with AI"
                    className="absolute top-2 right-2 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                  >
                    {isEnhancing ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiZap className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {wasEnhanced && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <FiCheck className="w-3 h-3" />
                    <span>Prompt enhanced!</span>
                  </div>
                )}
              </div>

              {/* Character Picker */}
              <CharacterPicker
                selectedIds={selectedCharacterIds}
                onChange={setSelectedCharacterIds}
                disabled={isGenerating}
              />

              {/* Style Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                >
                  {Object.entries(AI_STYLES).map(([key, styleConfig]) => (
                    <option key={key} value={key}>
                      {styleConfig.name}
                    </option>
                  ))}
                </select>
                {style !== 'none' && (
                  <p className="text-[10px] text-slate-500 italic">
                    Adds: "{AI_STYLES[style].suffix.slice(2)}"
                  </p>
                )}
              </div>

              {/* Options Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    {Object.entries(AI_MODELS).map(([key, modelConfig]) => (
                      <option key={key} value={key}>
                        {modelConfig.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">
                    {AI_MODELS[model]?.description} ({AI_MODELS[model]?.cost})
                  </p>
                </div>

                {/* Image Size */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Size</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    {imageSizeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.description} ({opt.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Progress Display */}
              {isGenerating && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="text-sm text-white">
                        {progress?.status === 'UPLOADING' && 'Uploading reference image...'}
                        {progress?.status === 'IN_QUEUE' && `In queue${progress.position ? ` (position: ${progress.position})` : '...'}`}
                        {progress?.status === 'IN_PROGRESS' && 'Generating image...'}
                        {(!progress || progress?.status === 'PENDING') && 'Starting...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {generatedImage && !isGenerating && (
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Preview</label>
                  <div className="relative bg-slate-800 rounded-lg overflow-hidden">
                    <img
                      src={generatedImage.imageUrl}
                      alt="Generated"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {generatedImage.width}x{generatedImage.height} - {generatedImage.usedCustomModel ? generatedImage.customModelName : (AI_MODELS[generatedImage.model]?.name || generatedImage.model)} - Seed: {generatedImage.seed}
                    {generatedImage.usedCustomModel && ' - Custom model'}
                  </p>
                </div>
              )}
            </>
          ) : activeTab === 'advanced' ? (
            /* Advanced Tab */
            <>
              {/* Image Generation Lockout Banner */}
              {isImageGenRestricted && lockoutMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Image Generation Restricted</p>
                      <p className="text-xs text-red-300/70 mt-1">{lockoutMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Structured Prompt Fields */}
              <div className="space-y-3">

                {/* Scene/Setting Field */}
                <div>
                  <label htmlFor="adv-scene" className="text-xs text-slate-400 block mb-1">
                    Scene / Setting
                  </label>
                  <textarea
                    id="adv-scene"
                    value={advancedPrompts.scene}
                    onChange={(e) => setAdvancedPrompts({...advancedPrompts, scene: e.target.value})}
                    placeholder="Location, environment, background details..."
                    rows={3}
                    disabled={isGenerating}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Lighting/Atmosphere Field */}
                <div>
                  <label htmlFor="adv-lighting" className="text-xs text-slate-400 block mb-1">
                    Lighting / Atmosphere
                  </label>
                  <textarea
                    id="adv-lighting"
                    value={advancedPrompts.lighting}
                    onChange={(e) => setAdvancedPrompts({...advancedPrompts, lighting: e.target.value})}
                    placeholder="Time of day, mood, lighting direction, weather..."
                    rows={3}
                    disabled={isGenerating}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Composition/Framing Field */}
                <div>
                  <label htmlFor="adv-composition" className="text-xs text-slate-400 block mb-1">
                    Composition / Framing
                  </label>
                  <textarea
                    id="adv-composition"
                    value={advancedPrompts.composition}
                    onChange={(e) => setAdvancedPrompts({...advancedPrompts, composition: e.target.value})}
                    placeholder="Camera angle, shot type (close-up, wide shot), perspective..."
                    rows={3}
                    disabled={isGenerating}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {/* Character/Subject Field */}
              <div>
                <label htmlFor="adv-character" className="text-xs text-slate-400 block mb-1">
                  Character / Subject
                </label>
                <textarea
                  id="adv-character"
                  value={advancedPrompts.character}
                  onChange={(e) => setAdvancedPrompts({...advancedPrompts, character: e.target.value})}
                  placeholder="Who or what is in the image, their actions, poses..."
                  rows={3}
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 resize-none"
                />
              </div>

              {/* Character Picker */}
              <CharacterPicker
                selectedIds={selectedCharacterIds}
                onChange={setSelectedCharacterIds}
                disabled={isGenerating}
                showDescription={false}
              />

              {/* Style Text Input */}
              <div className="space-y-2">
                <label htmlFor="adv-style" className="text-[10px] text-slate-500 uppercase font-bold block">
                  Style (Optional)
                </label>
                <input
                  id="adv-style"
                  type="text"
                  value={advancedStyle}
                  onChange={(e) => setAdvancedStyle(e.target.value)}
                  placeholder="e.g., comic book style, manga, photorealistic, watercolor..."
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Add style keywords to refine the artistic direction
                </p>
              </div>

              {/* Options Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    {Object.entries(AI_MODELS).map(([key, modelConfig]) => (
                      <option key={key} value={key}>
                        {modelConfig.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Size Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Image Size</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                  >
                    {imageSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.description} - {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Progress Display */}
              {isGenerating && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="text-sm text-white">
                        {progress?.status === 'COMPLETED' ? 'Completed' : 'Generating...'}
                      </p>
                      {progress?.logs && progress.logs.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {progress.logs[progress.logs.length - 1]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Image Preview */}
              {generatedImage && (
                <div className="space-y-3">
                  <div className="relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                    <img
                      src={generatedImage.imageUrl}
                      alt="Generated"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {generatedImage.width}x{generatedImage.height} - {generatedImage.usedCustomModel ? generatedImage.customModelName : (AI_MODELS[generatedImage.model]?.name || generatedImage.model)} - Seed: {generatedImage.seed}
                    {generatedImage.usedCustomModel && ' - Custom model'}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* History Tab - Visual Gallery */
            <HistoryGallery
              entries={history}
              isLoading={isHistoryLoading}
              hasMore={hasMoreHistory}
              totalCount={historyTotalCount}
              onLoadMore={loadMoreHistory}
              onSelect={handleHistoryClick}
              onTogglePin={toggleHistoryPin}
              onDelete={deleteHistoryEntry}
              onClearAll={clearHistory}
              getModelName={(modelKey) => AI_MODELS[modelKey]?.name || modelKey}
              getStyleName={(styleKey) => styleKey ? (AI_STYLES[styleKey]?.name || styleKey) : null}
            />
          )}
        </div>

        {/* Footer */}
        {isConfigured && activeTab === 'generate' && (
          <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <CreditCostPreview cost={currentCost} actionLabel="Image generation" inline />
            </div>

            <div className="flex gap-2">
              {generatedImage && !isGenerating && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save to Canvas'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </>
              )}

              {!generatedImage && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || isImageGenRestricted}
                  className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiZap className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer - Advanced Tab */}
        {isConfigured && activeTab === 'advanced' && (
          <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <CreditCostPreview cost={currentCost} actionLabel="Image generation" inline />
            </div>

            <div className="flex gap-2">
              {generatedImage && !isGenerating && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save to Canvas'}
                  </button>
                  <button
                    onClick={handleAdvancedGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </>
              )}

              {!generatedImage && (
                <button
                  onClick={handleAdvancedGenerate}
                  disabled={isGenerating || !combineStructuredPrompts().trim() || isImageGenRestricted}
                  className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiZap className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
