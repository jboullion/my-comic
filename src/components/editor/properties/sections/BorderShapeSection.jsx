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
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
          <input
            type="number"
            min="0"
            value={element.strokeWidth || 0}
            onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Radius</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={Math.min(element.width, element.height) / 2}
            value={element.cornerRadius || 0}
            onChange={(e) => onUpdate({ cornerRadius: parseInt(e.target.value) })}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-slate-400 w-8">{element.cornerRadius || 0}</span>
        </div>
      </div>

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
  )
}
