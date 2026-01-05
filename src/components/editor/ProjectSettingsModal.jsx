import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import NumberInput from './ui/NumberInput'
import PresetButton from './ui/PresetButton'

/**
 * ProjectSettingsModal Component
 * Modal dialog for editing project-wide default settings.
 * When applied, these settings are copied to ALL pages.
 */
export default function ProjectSettingsModal({ isOpen, onClose, settings, onApply }) {
  // Local state for editing
  const [localSettings, setLocalSettings] = useState({
    width: 800,
    height: 1200,
    backgroundColor: '#ffffff'
  })

  // Sync local state when modal opens or settings change
  useEffect(() => {
    if (isOpen && settings) {
      setLocalSettings({
        width: settings.width || 800,
        height: settings.height || 1200,
        backgroundColor: settings.backgroundColor || '#ffffff'
      })
    }
  }, [isOpen, settings])

  if (!isOpen) return null

  const handleApply = () => {
    onApply(localSettings)
    onClose()
  }

  const applyPreset = (width, height) => {
    setLocalSettings(prev => ({ ...prev, width, height }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Project Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Page Size */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Default Page Size</label>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Width"
                value={localSettings.width}
                onChange={(val) => setLocalSettings(prev => ({ ...prev, width: val }))}
                min={100}
                max={4000}
                step={10}
              />
              <NumberInput
                label="Height"
                value={localSettings.height}
                onChange={(val) => setLocalSettings(prev => ({ ...prev, height: val }))}
                min={100}
                max={4000}
                step={10}
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              <PresetButton
                label="Standard"
                size="800x1200"
                onClick={() => applyPreset(800, 1200)}
                active={localSettings.width === 800 && localSettings.height === 1200}
              />
              <PresetButton
                label="Manga"
                size="600x900"
                onClick={() => applyPreset(600, 900)}
                active={localSettings.width === 600 && localSettings.height === 900}
              />
              <PresetButton
                label="Square"
                size="1000x1000"
                onClick={() => applyPreset(1000, 1000)}
                active={localSettings.width === 1000 && localSettings.height === 1000}
              />
            </div>
          </div>

          {/* Background */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Default Background</label>

            {/* Transparent toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.backgroundColor === 'transparent'}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  backgroundColor: e.target.checked ? 'transparent' : '#ffffff'
                }))}
              />
              <span className="text-sm text-slate-300">Transparent background</span>
            </label>

            {/* Color picker - hidden when transparent */}
            {localSettings.backgroundColor !== 'transparent' && (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={localSettings.backgroundColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-10 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localSettings.backgroundColor}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
                />
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-slate-500">
            Applying these settings will update all existing pages to match these defaults.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
          >
            Apply to All Pages
          </button>
        </div>
      </div>
    </div>
  )
}
