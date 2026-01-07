import NumberInput from '../editor/ui/NumberInput'
import RangeInput from '../editor/ui/RangeInput'
import ColorPicker from '../editor/ui/ColorPicker'

/**
 * ImageSettingsTab Component
 * Default image element styling settings
 */
export default function ImageSettingsTab({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Image Element Defaults</h3>
        <p className="text-xs text-slate-400">
          These settings apply to new images added to the canvas.
        </p>
      </div>

      {/* Opacity */}
      <RangeInput
        label="Opacity"
        value={settings.opacity ?? 1}
        onChange={(val) => onUpdate({ opacity: val })}
        min={0}
        max={1}
        step={0.01}
      />

      {/* Border Settings */}
      <div className="pt-4 border-t border-slate-800">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Border</h4>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Border Color</label>
              <ColorPicker
                value={settings.stroke}
                onChange={(color) => onUpdate({ stroke: color })}
                className="w-full h-8"
              />
            </div>
            <NumberInput
              label="Border Width"
              value={settings.strokeWidth}
              onChange={(val) => onUpdate({ strokeWidth: val })}
              min={0}
              max={50}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* Corner Settings */}
      <div className="pt-4 border-t border-slate-800">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Corners</h4>

        <div className="space-y-4">
          <RangeInput
            label="Corner Radius %"
            value={settings.cornerRadius}
            onChange={(val) => onUpdate({ cornerRadius: val })}
            min={0}
            max={50}
            step={1}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Style</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={
                  settings.cornerRadius === 0 ? 'square' :
                  settings.cornerRadius === 5 ? 'rounded' :
                  settings.cornerRadius === 15 ? 'extra-rounded' :
                  settings.cornerRadius >= 50 ? 'pill' : 'custom'
                }
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'square') onUpdate({ cornerRadius: 0 })
                  if (val === 'rounded') onUpdate({ cornerRadius: 5 })
                  if (val === 'extra-rounded') onUpdate({ cornerRadius: 15 })
                  if (val === 'pill') onUpdate({ cornerRadius: 50 })
                }}
              >
                <option value="custom">Custom</option>
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="extra-rounded">Extra Rounded</option>
                <option value="pill">Pill / Circle</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Shape</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={settings.cornerShape}
                onChange={(e) => onUpdate({ cornerShape: e.target.value })}
              >
                <option value="round">Round</option>
                <option value="bevel">Bevel</option>
                <option value="notch">Notch</option>
                <option value="scoop">Scoop</option>
                <option value="squircle">Squircle</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
