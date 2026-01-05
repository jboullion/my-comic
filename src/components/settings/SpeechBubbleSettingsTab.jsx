import NumberInput from '../editor/ui/NumberInput'
import FontSelect from '../editor/ui/FontSelect'
import ColorPicker from '../editor/ui/ColorPicker'

/**
 * SpeechBubbleSettingsTab Component
 * Default speech bubble styling settings
 */
export default function SpeechBubbleSettingsTab({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Speech Bubble Defaults</h3>
        <p className="text-xs text-slate-400">
          These settings apply to new speech bubbles created with the Speech Bubble tool.
        </p>
      </div>

      {/* Bubble Style */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Bubble Style</label>
        <div className="flex gap-2">
          {['round', 'cloud'].map((style) => (
            <button
              key={style}
              onClick={() => onUpdate({ bubbleStyle: style })}
              className={`flex-1 py-2 px-4 text-sm rounded-lg transition-colors capitalize ${
                settings.bubbleStyle === style
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              type="button"
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Fill and Stroke */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
          <div className="flex items-center gap-2">
            <ColorPicker
              value={settings.fill}
              onChange={(color) => onUpdate({ fill: color })}
              className="w-10 h-10"
            />
            <input
              type="text"
              value={settings.fill}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Stroke Color</label>
          <div className="flex items-center gap-2">
            <ColorPicker
              value={settings.stroke}
              onChange={(color) => onUpdate({ stroke: color })}
              className="w-10 h-10"
            />
            <input
              type="text"
              value={settings.stroke}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
            />
          </div>
        </div>
      </div>

      {/* Stroke Width */}
      <NumberInput
        label="Stroke Width"
        value={settings.strokeWidth}
        onChange={(val) => onUpdate({ strokeWidth: val })}
        min={0}
        max={20}
        step={1}
      />

      {/* Text Settings */}
      <div className="pt-4 border-t border-slate-800">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Text Settings</h4>

        <div className="space-y-4">
          <FontSelect
            label="Font Family"
            value={settings.fontFamily}
            onChange={(val) => onUpdate({ fontFamily: val })}
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Font Size"
              value={settings.fontSize}
              onChange={(val) => onUpdate({ fontSize: val })}
              min={8}
              max={72}
              step={1}
            />
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Text Color</label>
              <ColorPicker
                value={settings.textColor}
                onChange={(color) => onUpdate({ textColor: color })}
                className="w-full h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
