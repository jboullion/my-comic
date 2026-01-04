import RangeInput from '../../ui/RangeInput'
import NumberInput from '../../ui/NumberInput'

/**
 * BubbleStyleSection Component
 * Style, fill, and stroke controls for speech bubble elements
 */
export default function BubbleStyleSection({ element, onUpdate }) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Style</label>
        <select
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          value={element.bubbleStyle || 'round'}
          onChange={(e) => onUpdate({ bubbleStyle: e.target.value })}
        >
          <option value="round">Round</option>
          <option value="cloud">Cloud</option>
        </select>
      </div>

      {element.bubbleStyle !== 'cloud' && (
        <>
          <RangeInput
            label="Corner Radius"
            value={element.cornerRadius || 20}
            onChange={(val) => onUpdate({ cornerRadius: val })}
            min={0}
            max={Math.min(element.width, element.height) / 2}
            step={1}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Style</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={
                  element.cornerRadius === 0 ? 'square' :
                  element.cornerRadius === 8 ? 'rounded' :
                  element.cornerRadius === 24 ? 'extra-rounded' :
                  element.cornerRadius >= Math.min(element.width, element.height) / 2 ? 'pill' : 'custom'
                }
                onChange={(e) => {
                  const val = e.target.value
                  const maxRadius = Math.min(element.width, element.height) / 2
                  if (val === 'square') onUpdate({ cornerRadius: 0 })
                  if (val === 'rounded') onUpdate({ cornerRadius: 8 })
                  if (val === 'extra-rounded') onUpdate({ cornerRadius: 24 })
                  if (val === 'pill') onUpdate({ cornerRadius: maxRadius })
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
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
        <input
          type="color"
          value={element.fill || '#FFFFFF'}
          onChange={(e) => onUpdate({ fill: e.target.value })}
          className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Stroke Color</label>
          <input
            type="color"
            value={element.stroke || '#000000'}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
          />
        </div>
        <NumberInput
          label="Stroke Width"
          value={element.strokeWidth || 2}
          onChange={(val) => onUpdate({ strokeWidth: val })}
          min={0}
          step={1}
        />
      </div>
    </>
  )
}
