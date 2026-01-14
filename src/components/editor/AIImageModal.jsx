import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FiX, FiZap, FiRefreshCw, FiCheck, FiCpu, FiClock } from 'react-icons/fi'
import { AI_MODELS, AI_STYLES } from '../../lib/ai/falai'
import { generateImageViaEdge, getImageGenerationCost } from '../../lib/ai/edgeFunctions'
import { fetchImageAsBlob } from '../../lib/ai/utils'
import { generationHistoryDb, fetchImageAsWebP } from '../../lib/generationHistory'
import { useGenerationHistory } from '../../hooks/useGenerationHistory'
import { useAIImageForm } from '../../hooks/useAIImageForm'
import { useCharacterLoRA } from '../../hooks/useCharacterLoRA'
import { usePromptEnhancement } from '../../hooks/usePromptEnhancement'
import HistoryGallery from './HistoryGallery'
import AIGenerateTab from './ai/AIGenerateTab'
import AIAdvancedTab from './ai/AIAdvancedTab'
import { useCredits } from '../../hooks/useCredits'
import { useIsImageGenRestricted, useImageGenLockoutMessage } from '../../stores/useCreditsStore'
import CreditCostPreview from '../credits/CreditCostPreview'

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

  // Form state hook
  const form = useAIImageForm({ projectId })

  // Character LoRA hook
  const { getCharacterLora, characters } = useCharacterLoRA(form.selectedCharacterIds)

  // Prompt enhancement hook
  const enhancement = usePromptEnhancement({
    prompt: form.prompt,
    setPrompt: form.setPrompt,
    selectedCharacterIds: form.selectedCharacterIds,
    setError: form.setError
  })

  // History with IndexedDB
  const history = useGenerationHistory({
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
    if (form.activeTab !== 'advanced') return
    if (form.selectedCharacterIds.length === 0) return

    const selectedChar = characters.find(c => form.selectedCharacterIds.includes(c.id))
    if (selectedChar?.description) {
      form.setAdvancedPrompts(prev => ({
        ...prev,
        character: selectedChar.description
      }))
    }
  }, [form.selectedCharacterIds, form.activeTab, characters, form.setAdvancedPrompts])

  // Always allow mature content
  const allowMature = true

  // Handle generation (Generate tab)
  const handleGenerate = useCallback(async () => {
    if (!form.prompt.trim()) {
      form.setError('Please enter a prompt')
      return
    }

    const cost = getImageGenerationCost(form.model)
    if (!hasCredits(cost)) {
      form.setError(`Not enough credits. This generation costs ${cost} credits, but you only have ${balance ?? 0}.`)
      return
    }

    form.setIsGenerating(true)
    form.setError(null)
    form.setProgress(null)

    try {
      const fullPrompt = form.prompt.trim()
      const lora = form.model === 'custom' ? getCharacterLora() : null
      const imageSizeParam = form.getImageSizeParam()

      const result = await generateImageViaEdge({
        prompt: fullPrompt,
        style: form.style,
        model: form.model,
        imageSize: imageSizeParam,
        allowMature,
        lora,
        customModel: form.model === 'custom' ? form.customModel : null,
        onProgress: form.setProgress
      })

      form.setGeneratedImage({ ...result, style: form.style })

      // Save to history
      try {
        const { blob: imageBlob, width: imageWidth, height: imageHeight } =
          await fetchImageAsWebP(result.imageUrl)

        await generationHistoryDb.add({
          projectId: Number(projectId),
          timestamp: Date.now(),
          pinned: false,
          prompt: form.prompt.trim(),
          style: form.style,
          model: form.model,
          imageSize: form.imageSize,
          imageBlob,
          imageWidth,
          imageHeight
        })

        await generationHistoryDb.pruneToLimit(Number(projectId), 100)
        history.refresh()
      } catch (historyErr) {
        console.error('Failed to save to history:', historyErr)
      }
    } catch (err) {
      form.setError(err.message)
      form.setGeneratedImage(null)
    } finally {
      form.setIsGenerating(false)
      form.setProgress(null)
    }
  }, [form, getCharacterLora, allowMature, hasCredits, balance, projectId, history])

  // Handle generation (Advanced tab)
  const handleAdvancedGenerate = useCallback(async () => {
    const combinedPrompt = form.combineStructuredPrompts()

    if (!combinedPrompt.trim()) {
      form.setError('Please fill in at least one prompt field')
      return
    }

    const cost = getImageGenerationCost(form.model)
    if (!hasCredits(cost)) {
      form.setError(`Not enough credits. This generation costs ${cost} credits, but you only have ${balance ?? 0}.`)
      return
    }

    form.setIsGenerating(true)
    form.setError(null)
    form.setProgress(null)

    try {
      const lora = form.model === 'custom' ? getCharacterLora() : null
      const imageSizeParam = form.getImageSizeParam()

      const result = await generateImageViaEdge({
        prompt: combinedPrompt,
        style: 'none',
        model: form.model,
        imageSize: imageSizeParam,
        seed: form.advancedParams.seed,
        allowMature,
        lora,
        customModel: form.model === 'custom' ? form.customModel : null,
        guidanceScale: form.advancedParams.guidanceScale,
        inferenceSteps: form.advancedParams.inferenceSteps,
        negativePrompt: form.advancedParams.negativePrompt,
        onProgress: form.setProgress
      })

      form.setGeneratedImage({ ...result, style: form.advancedStyle })

      // Save to history
      try {
        const { blob: imageBlob, width: imageWidth, height: imageHeight } =
          await fetchImageAsWebP(result.imageUrl)

        await generationHistoryDb.add({
          projectId: Number(projectId),
          timestamp: Date.now(),
          pinned: false,
          prompt: combinedPrompt,
          style: null,
          model: form.model,
          imageSize: form.imageSize,
          structuredPrompts: form.advancedPrompts,
          advancedStyle: form.advancedStyle,
          advancedParams: form.advancedParams,
          imageBlob,
          imageWidth,
          imageHeight
        })

        await generationHistoryDb.pruneToLimit(Number(projectId), 100)
        history.refresh()
      } catch (historyErr) {
        console.error('Failed to save to history:', historyErr)
      }
    } catch (err) {
      form.setError(err.message)
      form.setGeneratedImage(null)
    } finally {
      form.setIsGenerating(false)
      form.setProgress(null)
    }
  }, [form, getCharacterLora, allowMature, hasCredits, balance, projectId, history])

  // Handle save to canvas
  const handleSave = useCallback(async () => {
    if (!form.generatedImage?.imageUrl) return

    form.setIsSaving(true)
    form.setError(null)

    try {
      const blob = await fetchImageAsBlob(form.generatedImage.imageUrl)
      const fileName = `ai-generated-${Date.now()}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      const metadata = {
        prompt: form.prompt.trim(),
        model: form.generatedImage.model,
        style: form.generatedImage.style,
        seed: form.generatedImage.seed
      }

      await onSave(file, metadata)

      form.setPrompt('')
      form.setGeneratedImage(null)
      form.setError(null)
      form.setProgress(null)
      onClose()
    } catch (err) {
      form.setError(`Failed to save image: ${err.message}`)
    } finally {
      form.setIsSaving(false)
    }
  }, [form, onSave, onClose])

  // Handle close
  const handleClose = useCallback(() => {
    form.resetAllState()
    enhancement.clearEnhancementState()
    onClose()
  }, [form, enhancement, onClose])

  // Handle history click
  const handleHistoryClick = useCallback((entry) => {
    if (entry.structuredPrompts) {
      form.setAdvancedPrompts(entry.structuredPrompts)
      form.setAdvancedStyle(entry.advancedStyle || '')
      form.setActiveTab('advanced')
      if (entry.advancedParams) {
        form.setAdvancedParams(entry.advancedParams)
      }
    } else {
      form.setPrompt(entry.prompt)
      form.setStyle(entry.style || 'comic')
      form.setActiveTab('generate')
    }

    if (entry.model) {
      form.setModel(entry.model)
    }
    if (entry.imageSize) {
      form.setImageSize(entry.imageSize)
    }
  }, [form])

  if (!isOpen) return null

  const isConfigured = isLoggedIn
  const currentCost = getImageGenerationCost(form.model)

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
              onClick={() => form.setActiveTab('generate')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                form.activeTab === 'generate'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              <FiZap className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => form.setActiveTab('advanced')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                form.activeTab === 'advanced'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              <FiCpu className="w-4 h-4" />
              Advanced
            </button>
            <button
              onClick={() => form.setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                form.activeTab === 'history'
                  ? 'text-white border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              <FiClock className="w-4 h-4" />
              History
              {history.entries.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700 rounded-full">
                  {history.entries.length}
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
                <FiCpu className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">Sign In Required</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    Please sign in to use AI image generation. Your account includes free credits each month.
                  </p>
                </div>
              </div>
            </div>
          ) : form.activeTab === 'generate' ? (
            <AIGenerateTab
              prompt={form.prompt}
              setPrompt={form.setPrompt}
              style={form.style}
              setStyle={form.setStyle}
              model={form.model}
              setModel={form.setModel}
              imageSize={form.imageSize}
              setImageSize={form.setImageSize}
              selectedCharacterIds={form.selectedCharacterIds}
              setSelectedCharacterIds={form.setSelectedCharacterIds}
              imageSizeOptions={form.imageSizeOptions}
              isGenerating={form.isGenerating}
              generatedImage={form.generatedImage}
              error={form.error}
              progress={form.progress}
              isEnhancing={enhancement.isEnhancing}
              wasEnhanced={enhancement.wasEnhanced}
              onEnhancePrompt={enhancement.handleEnhancePrompt}
              onRevertPrompt={enhancement.handleRevertPrompt}
              onClearEnhancement={enhancement.clearEnhancementState}
              isImageGenRestricted={isImageGenRestricted}
              lockoutMessage={lockoutMessage}
            />
          ) : form.activeTab === 'advanced' ? (
            <AIAdvancedTab
              advancedPrompts={form.advancedPrompts}
              setAdvancedPrompts={form.setAdvancedPrompts}
              advancedStyle={form.advancedStyle}
              setAdvancedStyle={form.setAdvancedStyle}
              model={form.model}
              setModel={form.setModel}
              imageSize={form.imageSize}
              setImageSize={form.setImageSize}
              selectedCharacterIds={form.selectedCharacterIds}
              setSelectedCharacterIds={form.setSelectedCharacterIds}
              imageSizeOptions={form.imageSizeOptions}
              isGenerating={form.isGenerating}
              generatedImage={form.generatedImage}
              error={form.error}
              progress={form.progress}
              isImageGenRestricted={isImageGenRestricted}
              lockoutMessage={lockoutMessage}
            />
          ) : (
            <HistoryGallery
              entries={history.entries}
              isLoading={history.isLoading}
              hasMore={history.hasMore}
              totalCount={history.totalCount}
              onLoadMore={history.loadMore}
              onSelect={handleHistoryClick}
              onTogglePin={history.togglePin}
              onDelete={history.deleteEntry}
              onClearAll={history.clearAll}
              getModelName={(modelKey) => AI_MODELS[modelKey]?.name || modelKey}
              getStyleName={(styleKey) => styleKey ? (AI_STYLES[styleKey]?.name || styleKey) : null}
            />
          )}
        </div>

        {/* Footer - Generate Tab */}
        {isConfigured && form.activeTab === 'generate' && (
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
              {form.generatedImage && !form.isGenerating && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={form.isSaving}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    {form.isSaving ? 'Saving...' : 'Save to Canvas'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={form.isGenerating}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </>
              )}

              {!form.generatedImage && (
                <button
                  onClick={handleGenerate}
                  disabled={form.isGenerating || !form.prompt.trim() || isImageGenRestricted}
                  className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiZap className="w-4 h-4" />
                  {form.isGenerating ? 'Generating...' : 'Generate'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer - Advanced Tab */}
        {isConfigured && form.activeTab === 'advanced' && (
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
              {form.generatedImage && !form.isGenerating && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={form.isSaving}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    {form.isSaving ? 'Saving...' : 'Save to Canvas'}
                  </button>
                  <button
                    onClick={handleAdvancedGenerate}
                    disabled={form.isGenerating}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </>
              )}

              {!form.generatedImage && (
                <button
                  onClick={handleAdvancedGenerate}
                  disabled={form.isGenerating || !form.combineStructuredPrompts().trim() || isImageGenRestricted}
                  className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiZap className="w-4 h-4" />
                  {form.isGenerating ? 'Generating...' : 'Generate'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
