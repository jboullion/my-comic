import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FiX, FiZap, FiRefreshCw, FiCheck, FiAlertCircle, FiCpu, FiClock, FiTrash2, FiLoader } from 'react-icons/fi'
import { generateImage, AI_MODELS, AI_STYLES, isFalConfigured, enhanceImagePrompt } from '../../lib/ai/falai'
import { fetchImageAsBlob } from '../../lib/ai/utils'
import CharacterPicker from './CharacterPicker'
import LoRAList from '../civitai/LoRAList'
import { isCivitaiConfigured } from '../../lib/civitai'
import useCharactersStore from '../../stores/useCharactersStore'
import useProjectStore from '../../stores/useProjectStore'
import useSeriesStore from '../../stores/useSeriesStore'

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

// History storage helpers
const getHistoryKey = (projectId) => `ai-history:${projectId}`

const loadHistory = (projectId) => {
  if (!projectId) return []
  try {
    const stored = localStorage.getItem(getHistoryKey(projectId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveToHistory = (projectId, entry) => {
  if (!projectId) return
  const history = loadHistory(projectId)
  const updated = [entry, ...history].slice(0, 20)
  localStorage.setItem(getHistoryKey(projectId), JSON.stringify(updated))
  return updated
}

const deleteFromHistory = (projectId, entryId) => {
  if (!projectId) return []
  const history = loadHistory(projectId)
  const updated = history.filter(h => h.id !== entryId)
  localStorage.setItem(getHistoryKey(projectId), JSON.stringify(updated))
  return updated
}

const clearHistory = (projectId) => {
  if (!projectId) return
  localStorage.removeItem(getHistoryKey(projectId))
}

// Format relative time
const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * AIImageModal Component
 * Modal for generating AI images using Fal.ai FLUX models
 */
export default function AIImageModal({ isOpen, onClose, onSave }) {
  const { projectId } = useParams()

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

  // Additional LoRAs from CivitAI browser (besides character LoRAs)
  const [additionalLoras, setAdditionalLoras] = useState([])

  // Check if CivitAI is configured
  const civitaiConnected = isCivitaiConfigured()

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

  // Get allowMature from project settings
  const allowMature = customModel?.allowMature || false

  // Get characters from store for prompt building
  const { characters } = useCharactersStore()

  // Get LoRAs from selected characters that have them configured
  const getCharacterLoras = useCallback(() => {
    if (selectedCharacterIds.length === 0) return []

    const loras = []
    for (const id of selectedCharacterIds) {
      const char = characters.find(c => c.id === id)
      if (char?.loraUrl) {
        loras.push({
          id: `char-${char.id}`,
          name: char.name,
          url: char.loraUrl,
          triggerWords: char.loraTriggerWord ? [char.loraTriggerWord] : [],
          scale: char.loraScale ?? 0.8,
          thumbnail: char.profileImage?.url || null,
          fromCharacter: true,
        })
      }
    }
    return loras
  }, [selectedCharacterIds, characters])

  // Legacy function for backward compatibility
  const getCharacterLora = useCallback(() => {
    const loras = getCharacterLoras()
    if (loras.length === 0) return null
    return {
      url: loras[0].url,
      triggerWord: loras[0].triggerWords?.[0] || '',
      scale: loras[0].scale,
      characterName: loras[0].name,
    }
  }, [getCharacterLoras])

  // Combine character LoRAs with additional LoRAs from browser
  const getAllLoras = useCallback(() => {
    const charLoras = getCharacterLoras()
    // Combine, avoiding duplicates by URL
    const allLoras = [...charLoras]
    for (const lora of additionalLoras) {
      if (!allLoras.some(l => l.url === lora.url)) {
        allLoras.push(lora)
      }
    }
    return allLoras
  }, [getCharacterLoras, additionalLoras])

  // Check if we have any LoRAs available (for UI indicator)
  const allLoras = getAllLoras()
  const hasLora = allLoras.length > 0

  // Check if current model supports LoRA (only custom models support LoRA, not FLUX)
  const modelSupportsLora = model === 'custom'

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

  // History state
  const [history, setHistory] = useState([])

  // Load history when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      setHistory(loadHistory(projectId))
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
    { value: 'match_page', label: `${matchPageDimensions.width}x${matchPageDimensions.height}`, description: 'Match Page' },
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

      const enhanced = await enhanceImagePrompt(prompt.trim(), {
        model,
        characters: selectedChars
      })

      setPrompt(enhanced)
      setWasEnhanced(true)
    } catch (err) {
      setError(`Enhancement failed: ${err.message}`)
    } finally {
      setIsEnhancing(false)
    }
  }, [prompt, isEnhancing, model, characters, selectedCharacterIds])

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

    setIsGenerating(true)
    setError(null)
    setProgress(null)

    try {
      // Build prompt - only prepend character description if prompt wasn't already enhanced
      // (enhancement already incorporates character context)
      const fullPrompt = wasEnhanced
        ? prompt.trim()
        : buildPromptWithCharacters(prompt.trim())

      // Get all LoRAs (character + additional) - only for custom models
      const lorasToUse = model === 'custom' ? getAllLoras() : []

      // Use custom dimensions for "match_page", otherwise use preset string
      const imageSizeParam = imageSize === 'match_page'
        ? matchPageDimensions
        : imageSize

      const result = await generateImage({
        prompt: fullPrompt,
        style,
        model,
        imageSize: imageSizeParam,
        allowMature,
        loras: lorasToUse,
        customModel: model === 'custom' ? customModel : null,
        onProgress: setProgress
      })

      setGeneratedImage({ ...result, style })

      // Save to history
      const historyEntry = {
        id: Date.now(),
        prompt: prompt.trim(),
        style,
        model,
        imageSize,
        timestamp: Date.now()
      }
      const updatedHistory = saveToHistory(projectId, historyEntry)
      setHistory(updatedHistory)
    } catch (err) {
      setError(err.message)
      setGeneratedImage(null)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [prompt, style, model, imageSize, projectId, buildPromptWithCharacters, getAllLoras, allowMature, matchPageDimensions, customModel, wasEnhanced])

  const handleAdvancedGenerate = useCallback(async () => {
    const combinedPrompt = combineStructuredPrompts()

    if (!combinedPrompt.trim()) {
      setError('Please fill in at least one prompt field')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(null)

    try {
      // Get all LoRAs (character + additional) - only for custom models
      const lorasToUse = model === 'custom' ? getAllLoras() : []

      // Use custom dimensions for "match_page", otherwise use preset string
      const imageSizeParam = imageSize === 'match_page'
        ? matchPageDimensions
        : imageSize

      const result = await generateImage({
        prompt: combinedPrompt,
        style: 'none', // Style is included in the text prompt for advanced tab
        model,
        imageSize: imageSizeParam,
        seed: advancedParams.seed,
        allowMature,
        loras: lorasToUse,
        customModel: model === 'custom' ? customModel : null,
        // Advanced parameters
        guidanceScale: advancedParams.guidanceScale,
        inferenceSteps: advancedParams.inferenceSteps,
        negativePrompt: advancedParams.negativePrompt,
        onProgress: setProgress
      })

      setGeneratedImage({ ...result, style: advancedStyle })

      // Save to history with structured prompts
      const historyEntry = {
        id: Date.now(),
        prompt: combinedPrompt,
        structuredPrompts: advancedPrompts,
        advancedParams: advancedParams,
        advancedStyle,
        model,
        imageSize,
        timestamp: Date.now()
      }
      const updatedHistory = saveToHistory(projectId, historyEntry)
      setHistory(updatedHistory)
    } catch (err) {
      setError(err.message)
      setGeneratedImage(null)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [combineStructuredPrompts, advancedStyle, model, imageSize, projectId, getAllLoras, allowMature, matchPageDimensions, customModel, advancedPrompts, advancedParams])

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

  const handleHistoryClick = (entry) => {
    // Check if this is an advanced tab entry with structured prompts
    if (entry.structuredPrompts) {
      setAdvancedPrompts(entry.structuredPrompts)
      setAdvancedStyle(entry.advancedStyle || '')
      setActiveTab('advanced')
    } else {
      setPrompt(entry.prompt)
      setStyle(entry.style)
      setActiveTab('generate')
    }

    // Handle both old 'mode' format and new 'model' format from history
    if (entry.model) {
      setModel(entry.model)
    } else if (entry.mode === 'draft') {
      setModel('schnell')
    } else if (entry.mode === 'production') {
      setModel('flux-1-dev')
    }
    setImageSize(entry.imageSize)
  }

  const handleDeleteHistory = (entryId, e) => {
    e.stopPropagation()
    const updated = deleteFromHistory(projectId, entryId)
    setHistory(updated)
  }

  const handleClearHistory = () => {
    clearHistory(projectId)
    setHistory([])
  }

  if (!isOpen) return null

  const isConfigured = isFalConfigured()

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
            /* Not Configured Warning */
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">API Key Required</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    Add your Fal.ai API key to <code className="bg-slate-800 px-1 rounded">.env.local</code>:
                  </p>
                  <code className="block text-xs bg-slate-800 px-2 py-1 rounded mt-2 text-slate-300">
                    VITE_FAL_AI_KEY=your-key-here
                  </code>
                  <p className="text-xs text-amber-200/70 mt-2">
                    Get your API key from{' '}
                    <a
                      href="https://fal.ai/dashboard/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      fal.ai/dashboard/keys
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'generate' ? (
            /* Generate Tab */
            <>
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
                    {/* Custom model from series settings */}
                    {customModel?.enabled && (
                      <option value="custom">
                        ★ {customModel.name || 'Custom Model'}
                      </option>
                    )}
                    {Object.entries(AI_MODELS).map(([key, modelConfig]) => (
                      <option key={key} value={key}>
                        {modelConfig.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">
                    {model === 'custom'
                      ? `Custom ${customModel?.type?.toUpperCase()} model from CivitAI`
                      : `${AI_MODELS[model]?.description} (${AI_MODELS[model]?.cost})`
                    }
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

              {/* LoRA Section - Only show when CivitAI connected and using custom model */}
              {civitaiConnected && model === 'custom' && (
                <LoRAList
                  loras={getAllLoras()}
                  onChange={(newLoras) => {
                    // Filter out character LoRAs (they're managed separately)
                    const nonCharacterLoras = newLoras.filter(l => !l.fromCharacter)
                    setAdditionalLoras(nonCharacterLoras)
                  }}
                  baseModelFilter={customModel?.type === 'sdxl' ? 'SDXL 1.0' : customModel?.type === 'flux' ? 'Flux.1 D' : ''}
                  disabled={isGenerating}
                  allowNsfw={allowMature}
                />
              )}

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
                    {/* Custom model from series settings */}
                    {customModel?.enabled && (
                      <option value="custom">
                        ★ {customModel.name || 'Custom Model'}
                      </option>
                    )}
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
            /* History Tab */
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <FiClock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-400">No generation history yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Generated prompts will appear here
                  </p>
                </div>
              ) : (
                <>
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleHistoryClick(entry)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleHistoryClick(entry)
                        }
                      }}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg p-4 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white line-clamp-2">
                            {entry.prompt}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {(entry.advancedStyle || entry.style) && (
                              <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded">
                                {entry.advancedStyle || AI_STYLES[entry.style]?.name || entry.style}
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded">
                              {AI_MODELS[entry.model]?.name || entry.mode || 'Unknown'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatTimeAgo(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistory(entry.id, e)}
                          className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={handleClearHistory}
                      className="w-full px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Clear All History
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isConfigured && activeTab === 'generate' && (
          <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-slate-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

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
                  disabled={isGenerating || !prompt.trim()}
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
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

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
                  disabled={isGenerating || !combineStructuredPrompts().trim()}
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
