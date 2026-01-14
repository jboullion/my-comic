import { FiRotateCcw, FiAlertCircle } from 'react-icons/fi'
import { getDefaultStoryPromptTemplate } from '../../lib/ai/openrouter'

/**
 * AISettingsTab Component
 * Settings for AI features - custom Story AI prompt
 */
export default function AISettingsTab({ customStoryPrompt, onUpdate }) {
  const defaultPrompt = getDefaultStoryPromptTemplate()
  const prompt = customStoryPrompt || defaultPrompt
  const isUsingDefault = !customStoryPrompt

  const handlePromptChange = (e) => {
    const value = e.target.value
    // If the prompt matches default, store null to save space
    const isDefault = value.trim() === defaultPrompt.trim()
    onUpdate(isDefault ? null : value)
  }

  const handleResetToDefault = () => {
    if (window.confirm('Reset to default prompt? This will discard your custom prompt.')) {
      onUpdate(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Story AI Prompt Section */}
      <section>
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Story AI System Prompt
        </h2>

        {/* Info Banner */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-4">
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
        {isUsingDefault && (
          <p className="text-xs text-slate-500 mb-2">
            Currently using default prompt. Edit below to customize.
          </p>
        )}

        {/* Prompt Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="storyPrompt"
              className="block text-[10px] text-slate-500 uppercase font-bold"
            >
              System Prompt
            </label>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              <FiRotateCcw className="w-3 h-3" />
              Reset to Default
            </button>
          </div>
          <textarea
            id="storyPrompt"
            value={prompt}
            onChange={handlePromptChange}
            rows={18}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
            placeholder="Enter your custom Story AI system prompt..."
          />
          <p className="text-xs text-slate-500 mt-1">
            {prompt.length} characters
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-4">
          This prompt guides the Story AI assistant when helping you with dialogue, plot ideas, and scene descriptions.
          Customize it to match your story's tone, setting, and characters.
        </p>
      </section>
    </div>
  )
}
