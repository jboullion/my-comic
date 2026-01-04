import RangeInput from '../../ui/RangeInput'
import NumberInput from '../../ui/NumberInput'

/**
 * BorderShapeSection Component
 * Border and corner styling controls for image elements
 */
export default function BorderShapeSection({ element, onUpdate }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Color</label>
          <input
            type="color"
            value={element.stroke || '#000000'}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
          />
        </div>
        <NumberInput
          label="Width"
          value={element.strokeWidth || 0}
          onChange={(val) => onUpdate({ strokeWidth: val })}
          min={0}
          step={1}
        />
      </div>

      <RangeInput
        label="Corner Radius %"
        value={element.cornerRadius || 0}
        onChange={(val) => onUpdate({ cornerRadius: val })}
        min={0}
        max={50}
        step={1}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Style</label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={
              element.cornerRadius === 0 ? 'square' :
              element.cornerRadius === 5 ? 'rounded' :
              element.cornerRadius === 15 ? 'extra-rounded' :
              element.cornerRadius >= 50 ? 'pill' : 'custom'
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
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={element.cornerShape || 'round'}
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
    </>
  )
}
