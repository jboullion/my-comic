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

      {element.bubbleStyle === 'round' && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Radius</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="50"
              value={element.cornerRadius || 20}
              onChange={(e) => onUpdate({ cornerRadius: parseInt(e.target.value) })}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-xs text-slate-400 w-8">{element.cornerRadius || 20}</span>
          </div>
        </div>
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
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Stroke Width</label>
          <input
            type="number"
            min="0"
            value={element.strokeWidth || 2}
            onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) || 0 })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>
    </>
  )
}
