import { useState } from 'react'
import { FiPlus, FiX, FiUser } from 'react-icons/fi'
import { isCivitaiConfigured } from '../../lib/civitai'
import CivitAIBrowserModal from './CivitAIBrowserModal'

/**
 * LoRA List Component
 *
 * Displays a list of added LoRAs with scale sliders and remove buttons.
 * Includes an "Add LoRA" button that opens the CivitAI browser.
 *
 * @param {Object} props
 * @param {Array} props.loras - Array of LoRA objects: { id, name, url, scale, thumbnail, triggerWords }
 * @param {Function} props.onChange - Called with updated loras array
 * @param {string} props.baseModelFilter - Optional base model filter for browser
 * @param {boolean} props.disabled - Disable all interactions
 * @param {boolean} props.allowNsfw - Whether to include NSFW models in browser
 */
export default function LoRAList({
  loras = [],
  onChange,
  baseModelFilter = '',
  disabled = false,
  allowNsfw = false,
}) {
  const [showBrowser, setShowBrowser] = useState(false)
  const civitaiConnected = isCivitaiConfigured()

  const handleAddLora = (model) => {
    // Check if already added
    if (loras.some((l) => l.id === model.id)) {
      setShowBrowser(false)
      return
    }

    const newLora = {
      id: model.id,
      versionId: model.versionId,
      name: model.name,
      url: model.url,
      scale: 0.8,
      thumbnail: model.thumbnail,
      triggerWords: model.triggerWords || [],
      fromCharacter: false, // User added, not from character
    }

    onChange([...loras, newLora])
    setShowBrowser(false)
  }

  const handleRemoveLora = (id) => {
    onChange(loras.filter((l) => l.id !== id))
  }

  const handleScaleChange = (id, scale) => {
    onChange(
      loras.map((l) =>
        l.id === id ? { ...l, scale: parseFloat(scale) } : l
      )
    )
  }

  // Don't show if CivitAI not connected
  if (!civitaiConnected) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-slate-500 uppercase font-bold">
          LoRAs
        </label>
        <span className="text-[10px] text-slate-500">
          {loras.length} added
        </span>
      </div>

      {/* LoRA List */}
      {loras.length > 0 && (
        <div className="space-y-2">
          {loras.map((lora) => (
            <div
              key={lora.id}
              className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                {lora.thumbnail ? (
                  <img
                    src={lora.thumbnail}
                    alt={lora.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <FiUser className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white truncate" title={lora.name}>
                    {lora.name}
                  </p>
                  {lora.fromCharacter && (
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                      Character
                    </span>
                  )}
                </div>
                {lora.triggerWords?.length > 0 && (
                  <p className="text-[10px] text-slate-500 truncate">
                    Trigger: {lora.triggerWords.join(', ')}
                  </p>
                )}
              </div>

              {/* Scale Slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={lora.scale}
                  onChange={(e) => handleScaleChange(lora.id, e.target.value)}
                  disabled={disabled}
                  className="w-20 accent-indigo-500"
                />
                <span className="text-xs text-slate-400 w-8 text-right">
                  {lora.scale.toFixed(2)}
                </span>
              </div>

              {/* Remove Button */}
              {!lora.fromCharacter && (
                <button
                  type="button"
                  onClick={() => handleRemoveLora(lora.id)}
                  disabled={disabled}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  title="Remove LoRA"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add LoRA Button */}
      <button
        type="button"
        onClick={() => setShowBrowser(true)}
        disabled={disabled}
        className="w-full p-3 border border-dashed border-slate-700 hover:border-slate-600 rounded-lg text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiPlus className="w-4 h-4" />
        Add LoRA from CivitAI
      </button>

      {/* CivitAI Browser Modal */}
      <CivitAIBrowserModal
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSelect={handleAddLora}
        mode="lora"
        baseModelFilter={baseModelFilter}
        allowNsfw={allowNsfw}
      />
    </div>
  )
}
