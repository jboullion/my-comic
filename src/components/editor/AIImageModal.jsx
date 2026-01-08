import { useState, useCallback } from 'react'
import { FiX, FiZap, FiRefreshCw, FiCheck, FiAlertCircle, FiCpu } from 'react-icons/fi'
import { generateImage, fetchImageAsBlob, AI_MODELS, isFalConfigured } from '../../lib/falai'

/**
 * AIImageModal Component
 * Modal for generating AI images using Fal.ai FLUX models
 */
export default function AIImageModal({ isOpen, onClose, onSave }) {
  // Form state
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('draft')
  const [imageSize, setImageSize] = useState('square_hd')

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  const imageSizeOptions = [
    { value: 'square_hd', label: '1024x1024', description: 'Square HD' },
    { value: 'portrait_4_3', label: '768x1024', description: 'Portrait 4:3' },
    { value: 'portrait_16_9', label: '576x1024', description: 'Portrait 16:9' },
    { value: 'landscape_4_3', label: '1024x768', description: 'Landscape 4:3' },
    { value: 'landscape_16_9', label: '1024x576', description: 'Landscape 16:9' },
  ]

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress(null)

    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        mode,
        imageSize,
        onProgress: setProgress
      })

      setGeneratedImage(result)
    } catch (err) {
      setError(err.message)
      setGeneratedImage(null)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [prompt, mode, imageSize])

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

      // Call parent save handler
      await onSave(file)

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
  }, [generatedImage, onSave, onClose])

  const handleClose = useCallback(() => {
    // Reset state on close
    setPrompt('')
    setGeneratedImage(null)
    setError(null)
    setProgress(null)
    onClose()
  }, [onClose])

  if (!isOpen) return null

  // Check if Fal.ai is configured
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isConfigured ? (
            /* Not Configured Warning */
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
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
          ) : (
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

              {/* Options Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Mode Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Mode</label>
                  <div className="flex gap-2">
                    {Object.entries(AI_MODELS).map(([key, model]) => (
                      <button
                        key={key}
                        onClick={() => setMode(key)}
                        disabled={isGenerating}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          mode === key
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        } disabled:opacity-50`}
                      >
                        {model.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">{AI_MODELS[mode].cost}</p>
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
                    <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
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
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {generatedImage.width}x{generatedImage.height} - Seed: {generatedImage.seed}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {isConfigured && (
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
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save to Canvas'}
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
