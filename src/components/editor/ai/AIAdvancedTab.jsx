import { FiAlertCircle } from 'react-icons/fi'
import { AI_MODELS } from '../../../lib/ai/falai'
import CharacterPicker from '../CharacterPicker'
import AILockoutBanner from './AILockoutBanner'

/**
 * Advanced Tab Content for AI Image Modal
 * Contains structured prompt fields, style text input, and preview
 */
export default function AIAdvancedTab({
  // Advanced form state
  advancedPrompts,
  setAdvancedPrompts,
  advancedStyle,
  setAdvancedStyle,
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
  )
}
