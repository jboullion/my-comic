import NumberInput from '../../ui/NumberInput'
import FontSelect from '../../ui/FontSelect'

/**
 * TextEffectStyleSection Component
 * Styling controls for text effect elements (fill, stroke, outer stroke)
 */
export default function TextEffectStyleSection({ element, onUpdate }) {
  return (
    <div className="space-y-3">
      {/* Text content */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text</label>
        <input
          type="text"
          value={element.text || 'POW!'}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase font-bold"
          placeholder="POW!"
        />
      </div>

      {/* Font family */}
      <FontSelect
        label="Font Family"
        value={element.fontFamily || 'Bangers, cursive'}
        onChange={(val) => onUpdate({ fontFamily: val })}
      />

      {/* Font size and letter spacing */}
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Font Size"
          value={element.fontSize || 48}
          onChange={(val) => onUpdate({ fontSize: val })}
          min={12}
          max={200}
          step={1}
        />
        <NumberInput
          label="Letter Spacing"
          value={element.letterSpacing || 2}
          onChange={(val) => onUpdate({ letterSpacing: val })}
          min={-10}
          max={50}
          step={1}
        />
      </div>

      {/* Fill color */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.fill || '#FFFF00'}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-10 h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.fill || '#FFFF00'}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase"
          />
        </div>
      </div>

      {/* Stroke color and width */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Stroke</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.stroke || '#000000'}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-10 h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
          />
          <div className="flex-1">
            <NumberInput
              value={element.strokeWidth || 3}
              onChange={(val) => onUpdate({ strokeWidth: val })}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* Outer stroke color and width */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Outer Stroke</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={element.outerStroke || '#FF0000'}
            onChange={(e) => onUpdate({ outerStroke: e.target.value })}
            className="w-10 h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
          />
          <div className="flex-1">
            <NumberInput
              value={element.outerStrokeWidth || 0}
              onChange={(val) => onUpdate({ outerStrokeWidth: val })}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-600">Set width to 0 to disable outer stroke</p>
      </div>

      {/* Text alignment */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Alignment</label>
        <div className="flex gap-1">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={`flex-1 py-1.5 px-2 text-xs rounded transition-colors ${
                (element.textAlign || 'center') === align
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
