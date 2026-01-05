import NumberInput from '../editor/ui/NumberInput'
import PresetButton from '../editor/ui/PresetButton'
import ColorPicker from '../editor/ui/ColorPicker'

/**
 * PageSettingsTab Component
 * Default page dimensions and background settings
 */
export default function PageSettingsTab({ settings, onUpdate }) {
  const applyPreset = (width, height) => {
    onUpdate({ width, height })
  }

  return (
    <div className="space-y-6">
      {/* Page Size Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Default Page Size</h3>
        <p className="text-xs text-slate-400">
          New pages will be created with these dimensions.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Width"
            value={settings.width}
            onChange={(val) => onUpdate({ width: val })}
            min={100}
            max={4000}
            step={10}
          />
          <NumberInput
            label="Height"
            value={settings.height}
            onChange={(val) => onUpdate({ height: val })}
            min={100}
            max={4000}
            step={10}
          />
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Presets</label>
          <div className="grid grid-cols-3 gap-2">
            <PresetButton
              label="Standard"
              size="800x1200"
              onClick={() => applyPreset(800, 1200)}
              active={settings.width === 800 && settings.height === 1200}
            />
            <PresetButton
              label="Manga"
              size="600x900"
              onClick={() => applyPreset(600, 900)}
              active={settings.width === 600 && settings.height === 900}
            />
            <PresetButton
              label="Square"
              size="1000x1000"
              onClick={() => applyPreset(1000, 1000)}
              active={settings.width === 1000 && settings.height === 1000}
            />
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Default Background</h3>
        <p className="text-xs text-slate-400">
          Background color for new pages.
        </p>

        {/* Transparent toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.backgroundColor === 'transparent'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.checked ? 'transparent' : '#ffffff' })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
          />
          <span className="text-sm text-slate-300">Transparent background</span>
        </label>

        {/* Color picker - hidden when transparent */}
        {settings.backgroundColor !== 'transparent' && (
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Background Color</label>
            <div className="flex items-center gap-3">
              <ColorPicker
                value={settings.backgroundColor}
                onChange={(color) => onUpdate({ backgroundColor: color })}
                className="w-10 h-10"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
