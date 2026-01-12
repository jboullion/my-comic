import { useState, useEffect } from 'react'
import { FiX, FiRotateCcw, FiLoader, FiAlertCircle } from 'react-icons/fi'
import useSeriesStore from '../../stores/useSeriesStore'
import { getDefaultStoryPromptTemplate } from '../../lib/ai/openrouter'

/**
 * StoryPromptModal Component
 * Modal for editing the Story AI system prompt for a series
 */
export default function StoryPromptModal() {
  const {
    isStoryPromptModalOpen,
    editingSeriesForPrompt,
    closeStoryPromptModal,
    updateSeriesStoryPrompt,
    clearSeriesStoryPrompt
  } = useSeriesStore()

  const [prompt, setPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  const defaultPrompt = getDefaultStoryPromptTemplate()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isStoryPromptModalOpen && editingSeriesForPrompt) {
      const customPrompt = editingSeriesForPrompt.customStoryPrompt || defaultPrompt
      setPrompt(customPrompt)
      setHasChanges(false)
      setError(null)
    }
  }, [isStoryPromptModalOpen, editingSeriesForPrompt, defaultPrompt])

  const handlePromptChange = (e) => {
    setPrompt(e.target.value)
    setHasChanges(true)
  }

  const handleResetToDefault = () => {
    if (window.confirm('Reset to default prompt? This will discard your custom prompt.')) {
      setPrompt(defaultPrompt)
      setHasChanges(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!prompt.trim()) {
      setError('Prompt cannot be empty')
      return
    }

    setIsSaving(true)

    try {
      // If prompt matches default, clear custom prompt to save space
      const isDefault = prompt.trim() === defaultPrompt.trim()

      if (isDefault) {
        await clearSeriesStoryPrompt(editingSeriesForPrompt.id)
      } else {
        await updateSeriesStoryPrompt(editingSeriesForPrompt.id, prompt.trim())
      }

      // Modal will be closed by store action
    } catch (err) {
      console.error('Failed to save story prompt:', err)
      setError('Failed to save prompt')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (hasChanges && !isSaving) {
      if (window.confirm('Discard unsaved changes?')) {
        closeStoryPromptModal()
      }
    } else if (!isSaving) {
      closeStoryPromptModal()
    }
  }

  if (!isStoryPromptModalOpen) return null

  const isUsingDefault = !editingSeriesForPrompt?.customStoryPrompt

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Edit Story AI Prompt</h2>
            <p className="text-xs text-slate-400 mt-1">
              Series: {editingSeriesForPrompt?.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto">
            {/* Info Banner */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-200">
                  <p className="font-medium mb-1">Template Variables</p>
                  <p>You can use these variables in your prompt:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-indigo-300">
                    <li><code className="bg-indigo-950/50 px-1 rounded">{'${projectContext.title || \'Untitled\'}'}</code> - Project title</li>
                    <li><code className="bg-indigo-950/50 px-1 rounded">{'${projectContext.pageNumber || 1}'}</code> - Current page number</li>
                    <li><code className="bg-indigo-950/50 px-1 rounded">{'${projectContext.totalPages || 1}'}</code> - Total pages</li>
                    <li><code className="bg-indigo-950/50 px-1 rounded">{'${characterList}'}</code> - List of characters with descriptions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            {isUsingDefault && !hasChanges && (
              <p className="text-xs text-slate-500">
                Currently using default prompt. Edit below to customize.
              </p>
            )}

            {/* Prompt Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="prompt"
                  className="block text-[10px] text-slate-500 uppercase font-bold"
                >
                  System Prompt
                </label>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  <FiRotateCcw className="w-3 h-3" />
                  Reset to Default
                </button>
              </div>
              <textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                disabled={isSaving}
                rows={18}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-none font-mono"
                placeholder="Enter your custom Story AI system prompt..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {prompt.length} characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Prompt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
