import NumberInput from '../editor/ui/NumberInput'
import FontSelect from '../editor/ui/FontSelect'

/**
 * TextEffectSettingsTab Component
 * Default text effect styling settings
 */
export default function TextEffectSettingsTab({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Text Effect Defaults</h3>
        <p className="text-xs text-slate-400">
          These settings apply to new text effects created with the Text Effect tool.
        </p>
      </div>

      {/* Default Text */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Default Text</label>
        <input
          type="text"
          value={settings.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          placeholder="EFFECT!"
        />
        <p className="text-xs text-slate-500">The text shown when a new effect is added.</p>
      </div>

      {/* Font Settings */}
      <div className="space-y-4">
        <FontSelect
          label="Font Family"
          value={settings.fontFamily}
          onChange={(val) => onUpdate({ fontFamily: val })}
          filter="comic"
        />

        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Font Size"
            value={settings.fontSize}
            onChange={(val) => onUpdate({ fontSize: val })}
            min={12}
            max={200}
            step={1}
          />
          <NumberInput
            label="Letter Spacing"
            value={settings.letterSpacing}
            onChange={(val) => onUpdate({ letterSpacing: val })}
            min={-10}
            max={50}
            step={1}
          />
        </div>
      </div>

      {/* Fill Color */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-10 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
          />
          <input
            type="text"
            value={settings.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
          />
        </div>
      </div>

      {/* Stroke */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Stroke</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-10 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
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
      </div>

      {/* Outer Stroke */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Outer Stroke</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.outerStroke}
            onChange={(e) => onUpdate({ outerStroke: e.target.value })}
            className="w-10 h-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
          />
          <div className="flex-1">
            <NumberInput
              value={settings.outerStrokeWidth}
              onChange={(val) => onUpdate({ outerStrokeWidth: val })}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">Set width to 0 for no outer stroke.</p>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-slate-800">
        <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block">Preview</label>
        <div className="bg-slate-800 rounded-lg p-6 flex items-center justify-center min-h-[100px]">
          <svg
            width="200"
            height="80"
            viewBox="0 0 200 80"
            style={{ overflow: 'visible' }}
          >
            {/* Outer stroke layer */}
            {settings.outerStrokeWidth > 0 && (
              <text
                x="100"
                y="50"
                textAnchor="middle"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${Math.min(settings.fontSize, 48)}px`,
                  fontWeight: 'bold',
                  letterSpacing: `${settings.letterSpacing}px`,
                  fill: 'none',
                  stroke: settings.outerStroke,
                  strokeWidth: settings.strokeWidth + settings.outerStrokeWidth * 2,
                  strokeLinejoin: 'round'
                }}
              >
                {settings.text || 'EFFECT!'}
              </text>
            )}
            {/* Main stroke layer */}
            {settings.strokeWidth > 0 && (
              <text
                x="100"
                y="50"
                textAnchor="middle"
                style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${Math.min(settings.fontSize, 48)}px`,
                  fontWeight: 'bold',
                  letterSpacing: `${settings.letterSpacing}px`,
                  fill: 'none',
                  stroke: settings.stroke,
                  strokeWidth: settings.strokeWidth,
                  strokeLinejoin: 'round'
                }}
              >
                {settings.text || 'EFFECT!'}
              </text>
            )}
            {/* Fill layer */}
            <text
              x="100"
              y="50"
              textAnchor="middle"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${Math.min(settings.fontSize, 48)}px`,
                fontWeight: 'bold',
                letterSpacing: `${settings.letterSpacing}px`,
                fill: settings.fill
              }}
            >
              {settings.text || 'EFFECT!'}
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
