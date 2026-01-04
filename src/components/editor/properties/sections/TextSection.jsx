/**
 * TextSection Component
 * Text content and formatting controls for speech bubble elements
 */
export default function TextSection({ element, onUpdate }) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text</label>
        <textarea
          value={element.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          rows={3}
          placeholder="Enter dialog text..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Font Size</label>
          <input
            type="number"
            min="8"
            max="72"
            value={element.fontSize || 16}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 16 })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Text Color</label>
          <input
            type="color"
            value={element.textColor || '#000000'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Alignment</label>
        <select
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          value={element.textAlign || 'center'}
          onChange={(e) => onUpdate({ textAlign: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </>
  )
}
