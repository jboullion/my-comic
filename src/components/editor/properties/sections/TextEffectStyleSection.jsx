import NumberInput from '../../ui/NumberInput'
import RangeInput from '../../ui/RangeInput'
import FontSelect from '../../ui/FontSelect'
import ColorPicker from '../../ui/ColorPicker'

const EFFECT_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'bend', label: 'Bend' },
  { value: 'perspective', label: 'Skew' },
]

/**
 * TextEffectStyleSection Component
 * Styling controls for text effect elements (fill, stroke, outer stroke, path effects)
 */
export default function TextEffectStyleSection({ element, onUpdate, projectFonts }) {
  const effectType = element.effectType || 'none'

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
        projectFonts={projectFonts}
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

      {/* Effect Type */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Effect</label>
        <div className="flex flex-wrap gap-1">
          {EFFECT_TYPES.map((effect) => (
            <button
              key={effect.value}
              onClick={() => onUpdate({ effectType: effect.value })}
              className={`py-1.5 px-3 text-xs rounded transition-colors ${
                effectType === effect.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              type="button"
            >
              {effect.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bend controls */}
      {effectType === 'bend' && (
        <RangeInput
          label="Bend Amount"
          value={element.bend || 0}
          onChange={(val) => onUpdate({ bend: val })}
          min={-100}
          max={100}
          step={5}
        />
      )}

      {/* Skew controls */}
      {effectType === 'perspective' && (
        <>
          <RangeInput
            label="Skew X"
            value={element.skewX || 0}
            onChange={(val) => onUpdate({ skewX: val })}
            min={-45}
            max={45}
            step={5}
            suffix="°"
          />
          <RangeInput
            label="Skew Y"
            value={element.skewY || 0}
            onChange={(val) => onUpdate({ skewY: val })}
            min={-45}
            max={45}
            step={5}
            suffix="°"
          />
        </>
      )}

      {/* Fill color */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
        <div className="flex items-center gap-2">
          <ColorPicker
            value={element.fill || '#FFFF00'}
            onChange={(color) => onUpdate({ fill: color })}
            className="w-10 h-8"
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
          <ColorPicker
            value={element.stroke || '#000000'}
            onChange={(color) => onUpdate({ stroke: color })}
            className="w-10 h-8"
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
          <ColorPicker
            value={element.outerStroke || '#FF0000'}
            onChange={(color) => onUpdate({ outerStroke: color })}
            className="w-10 h-8"
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
