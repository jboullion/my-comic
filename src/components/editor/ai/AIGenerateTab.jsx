import { FiZap, FiRefreshCw, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi'
import { AI_MODELS, AI_STYLES } from '../../../lib/ai/falai'
import CharacterPicker from '../CharacterPicker'
import AILockoutBanner from './AILockoutBanner'

/**
 * Generate Tab Content for AI Image Modal
 * Contains prompt input, style/model selection, and preview
 */
export default function AIGenerateTab({
  // Form state
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
  imageSizeOptions,

  // Generation state
  isGenerating,
  generatedImage,
  error,
  progress,

  // Enhancement state
  isEnhancing,
  wasEnhanced,
  onEnhancePrompt,
  onRevertPrompt,
  onClearEnhancement,

  // Lockout state
  isImageGenRestricted,
  lockoutMessage
}) {
  return (
    <>
      {/* Image Generation Lockout Banner */}
      <AILockoutBanner
        isRestricted={isImageGenRestricted}
        message={lockoutMessage}
      />

      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Prompt</label>
          {wasEnhanced && (
            <button
              onClick={onRevertPrompt}
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
                onClearEnhancement()
              }
            }}
            placeholder="Describe the image you want to generate..."
            rows={4}
            disabled={isGenerating || isEnhancing}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none disabled:opacity-50"
          />
          {/* AI Enhance Button */}
          <button
            onClick={onEnhancePrompt}
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
  )
}
