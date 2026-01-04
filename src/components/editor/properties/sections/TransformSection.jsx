/**
 * TransformSection Component
 * Opacity and rotation controls (shared across all element types)
 */
export default function TransformSection({ element, onUpdate }) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={element.opacity ?? 1}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Rotation</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="360"
            value={element.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-xs text-slate-400 w-8">{Math.round(element.rotation || 0)}°</span>
        </div>
      </div>
    </>
  )
}
