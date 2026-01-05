import NumberInput from '../editor/ui/NumberInput'
import FontSelect from '../editor/ui/FontSelect'
import ColorPicker from '../editor/ui/ColorPicker'

/**
 * TextSettingsTab Component
 * Default text element styling settings
 */
export default function TextSettingsTab({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Text Element Defaults</h3>
        <p className="text-xs text-slate-400">
          These settings apply to new text elements created with the Text tool.
        </p>
      </div>

      {/* Font Family */}
      <div className="space-y-4">
        <FontSelect
          label="Default Font"
          value={settings.fontFamily}
          onChange={(val) => onUpdate({ fontFamily: val })}
        />

        {/* Font Size and Weight */}
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Font Size"
            value={settings.fontSize}
            onChange={(val) => onUpdate({ fontSize: val })}
            min={8}
            max={200}
            step={1}
          />
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Font Weight</label>
            <select
              value={settings.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={settings.textColor}
            onChange={(color) => onUpdate({ textColor: color })}
            className="w-10 h-10"
          />
          <input
            type="text"
            value={settings.textColor}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
          />
        </div>
      </div>

      {/* Text Stroke */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Stroke</label>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={settings.strokeColor}
            onChange={(color) => onUpdate({ strokeColor: color })}
            className="w-10 h-10"
          />
          <div className="flex-1">
            <NumberInput
              value={settings.strokeWidth}
              onChange={(val) => onUpdate({ strokeWidth: val })}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">Set width to 0 for no stroke.</p>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Alignment</label>
        <div className="flex gap-1">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
                settings.textAlign === align
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              type="button"
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
