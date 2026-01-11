import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FiX, FiZap, FiRefreshCw, FiCheck, FiAlertCircle, FiCpu, FiClock, FiTrash2 } from 'react-icons/fi'
import * as falai from '../../lib/falai'
import * as replicate from '../../lib/replicate'
import CharacterPicker from './CharacterPicker'
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

  // Determine which provider to use
  const provider = customModel?.provider || 'falai'
  const activeProvider = provider === 'replicate' ? replicate : falai

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
  const [referenceStrength, setReferenceStrength] = useState(0.65)

  // Get allowMature from project settings
  const allowMature = customModel?.allowMature || false

  // Get characters from store for prompt building
  const { characters } = useCharactersStore()

  // Get reference image from first selected character with a profile image
  const getReferenceImage = useCallback(() => {
    if (selectedCharacterIds.length === 0) return null

    // Find first selected character with a profile image
    for (const id of selectedCharacterIds) {
      const char = characters.find(c => c.id === id)
      if (char?.profileImage?.blob) {
        return char.profileImage.blob
      }
    }
    return null
  }, [selectedCharacterIds, characters])

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

  // Check if we have a reference image available
  const hasReferenceImage = getReferenceImage() !== null

  // Check if we have a LoRA available (for UI indicator)
  const characterLora = getCharacterLora()
  const hasLora = characterLora !== null

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // History state
  const [history, setHistory] = useState([])

  // Load history when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      setHistory(loadHistory(projectId))
    }
  }, [isOpen, projectId])

  const imageSizeOptions = [
    { value: 'match_page', label: `${matchPageDimensions.width}x${matchPageDimensions.height}`, description: 'Match Page' },
    { value: 'square_hd', label: '1024x1024', description: 'Square HD' },
    { value: 'portrait_4_3', label: '768x1024', description: 'Portrait 4:3' },
    { value: 'portrait_16_9', label: '576x1024', description: 'Portrait 16:9' },
    { value: 'landscape_4_3', label: '1024x768', description: 'Landscape 4:3' },
    { value: 'landscape_16_9', label: '1024x576', description: 'Landscape 16:9' },
  ]

  // Build prompt with character descriptions
  const buildPromptWithCharacters = useCallback((basePrompt) => {
    if (selectedCharacterIds.length === 0) return basePrompt

    const selectedChars = characters.filter(c => selectedCharacterIds.includes(c.id))
    const charDescriptions = selectedChars
      .filter(c => c.description)
      .map(c => `${c.name}: ${c.description}`)
      .join('\n')

    if (!charDescriptions) return basePrompt

    return `Characters in scene:\n${charDescriptions}\n\nScene: ${basePrompt}`
  }, [selectedCharacterIds, characters])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(null)

    try {
      // Build prompt with character descriptions
      const fullPrompt = buildPromptWithCharacters(prompt.trim())

      // Get reference image if available (only used if no LoRA - LoRA takes priority)
      const referenceImage = getReferenceImage()

      // Get LoRA from selected character
      const lora = getCharacterLora()

      // Use custom dimensions for "match_page", otherwise use preset string
      const imageSizeParam = imageSize === 'match_page'
        ? matchPageDimensions
        : imageSize

      const result = await activeProvider.generateImage({
        prompt: fullPrompt,
        style,
        model,
        imageSize: imageSizeParam,
        referenceImage,
        referenceStrength,
        allowMature,
        lora,
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
  }, [prompt, style, model, imageSize, projectId, buildPromptWithCharacters, getReferenceImage, getCharacterLora, referenceStrength, allowMature, matchPageDimensions, customModel, activeProvider])

  const handleSave = useCallback(async () => {
    if (!generatedImage?.imageUrl) return

    setIsSaving(true)
    setError(null)

    try {
      // Fetch image as blob
      const blob = await activeProvider.fetchImageAsBlob(generatedImage.imageUrl)

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
  }, [generatedImage, prompt, onSave, onClose, activeProvider])

  const handleClose = useCallback(() => {
    setPrompt('')
    setGeneratedImage(null)
    setError(null)
    setProgress(null)
    setActiveTab('generate')
    setSelectedCharacterIds([])
    onClose()
  }, [onClose])

  const handleHistoryClick = (entry) => {
    setPrompt(entry.prompt)
    setStyle(entry.style)
    // Handle both old 'mode' format and new 'model' format from history
    if (entry.model) {
      setModel(entry.model)
    } else if (entry.mode === 'draft') {
      setModel('schnell')
    } else if (entry.mode === 'production') {
      setModel('flux-1-dev')
    }
    setImageSize(entry.imageSize)
    setActiveTab('generate')
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

  // Check if active provider is configured
  const isConfigured = provider === 'replicate'
    ? replicate.isReplicateConfigured()
    : falai.isFalConfigured()

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
          <div className="flex items-center gap-3">
            <FiCpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">AI Image Generator</h2>
            <span className="text-xs px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400">
              {provider === 'replicate' ? 'Replicate' : 'Fal.ai'}
            </span>
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
                <label className="text-[10px] text-slate-500 uppercase font-bold">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={3}
                  disabled={isGenerating}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none disabled:opacity-50"
                />
              </div>

              {/* Character Picker */}
              <CharacterPicker
                selectedIds={selectedCharacterIds}
                onChange={setSelectedCharacterIds}
                disabled={isGenerating}
              />

              {/* LoRA Indicator - shown when character with LoRA is selected */}
              {hasLora && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-sm font-medium">LoRA Active</span>
                    <span className="text-slate-400 text-xs">
                      {characterLora.characterName}
                      {characterLora.triggerWord && ` - "${characterLora.triggerWord}"`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Trigger word will be auto-prepended to your prompt. Strength: {Math.round(characterLora.scale * 100)}%
                  </p>
                </div>
              )}

              {/* Reference Strength Slider - only shown when character with profile image is selected and no LoRA */}
              {hasReferenceImage && !hasLora && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">
                      Reference Strength
                    </label>
                    <span className="text-xs text-slate-400">
                      {Math.round(referenceStrength * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={referenceStrength * 100}
                    onChange={(e) => setReferenceStrength(Number(e.target.value) / 100)}
                    disabled={isGenerating}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-slate-500">
                    Higher values match the character&apos;s profile image more closely
                  </p>
                </div>
              )}

              {/* Style Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                >
                  {Object.entries(activeProvider.AI_STYLES).map(([key, styleConfig]) => (
                    <option key={key} value={key}>
                      {styleConfig.name}
                    </option>
                  ))}
                </select>
                {style !== 'none' && (
                  <p className="text-[10px] text-slate-500 italic">
                    Adds: "{activeProvider.AI_STYLES[style].suffix.slice(2)}"
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
                    {/* Series custom model (if enabled) */}
                    {customModel?.enabled && customModel?.url && (
                      <option value="custom">
                        📌 {customModel.name || 'Custom Model'}
                      </option>
                    )}
                    {/* Standard FLUX models */}
                    {Object.entries(activeProvider.AI_MODELS).map(([key, modelConfig]) => (
                      <option key={key} value={key}>
                        {modelConfig.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">
                    {model === 'custom'
                      ? `Series custom ${customModel?.type?.toUpperCase() || ''} model`
                      : `${activeProvider.AI_MODELS[model]?.description} (${activeProvider.AI_MODELS[model]?.cost})`
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

              {/* Mature Content Indicator (controlled in Series Settings) */}
              {allowMature && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <span className="text-xs text-amber-300">
                    Mature content enabled (Series Settings → AI Model)
                  </span>
                </div>
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
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {provider === 'replicate' ? (
                          // Replicate progress (simpler - no queue position or logs)
                          <>
                            {progress?.status === 'starting' && 'Starting generation...'}
                            {progress?.status === 'processing' && 'Generating image...'}
                            {!progress && 'Preparing...'}
                          </>
                        ) : (
                          // Fal.ai progress (with queue position and logs)
                          <>
                            {progress?.status === 'UPLOADING' && 'Uploading reference image...'}
                            {progress?.status === 'IN_QUEUE' && `In queue${progress.position ? ` (position: ${progress.position})` : '...'}`}
                            {progress?.status === 'IN_PROGRESS' && 'Generating image...'}
                            {(!progress || progress?.status === 'PENDING') && 'Starting...'}
                          </>
                        )}
                      </p>
                      {/* Only show queue position for Fal.ai */}
                      {provider === 'falai' && progress?.position > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Queue position: {progress.position}
                        </p>
                      )}
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
                    {generatedImage.width}x{generatedImage.height} - {generatedImage.usedCustomModel ? generatedImage.customModelName : (activeProvider.AI_MODELS[generatedImage.model]?.name || generatedImage.model)} - Seed: {generatedImage.seed}
                    {generatedImage.usedReference && ' - Used character reference'}
                    {generatedImage.usedLora && ' - Used LoRA'}
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
                            <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded">
                              {activeProvider.AI_STYLES[entry.style]?.name || entry.style}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded">
                              {activeProvider.AI_MODELS[entry.model]?.name || entry.mode || 'Unknown'}
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
      </div>
    </div>
  )
}
