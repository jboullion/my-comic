import NumberInput from '../../ui/NumberInput'
import FontSelect from '../../ui/FontSelect'
import ColorPicker from '../../ui/ColorPicker'

/**
 * TextStyleSection Component
 * Text styling controls for text elements (font, size, color, alignment)
 */
export default function TextStyleSection({ element, onUpdate }) {
  return (
    <div className="space-y-3">
      {/* Text content */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text</label>
        <textarea
          value={element.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          rows={3}
          placeholder="Enter text..."
        />
      </div>

      {/* Font family */}
      <FontSelect
        label="Font Family"
        value={element.fontFamily || 'Arial, sans-serif'}
        onChange={(val) => onUpdate({ fontFamily: val })}
      />

      {/* Font size and weight */}
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Font Size"
          value={element.fontSize || 24}
          onChange={(val) => onUpdate({ fontSize: val })}
          min={8}
          max={200}
          step={1}
        />
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Font Weight</label>
          <select
            value={element.fontWeight || 'normal'}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>

      {/* Text color */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Color</label>
        <div className="flex items-center gap-2">
          <ColorPicker
            value={element.textColor || '#000000'}
            onChange={(color) => onUpdate({ textColor: color })}
            className="w-10 h-8"
          />
          <input
            type="text"
            value={element.textColor || '#000000'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase"
          />
        </div>
      </div>

      {/* Text stroke */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-bold">Text Stroke</label>
        <div className="flex items-center gap-2">
          <ColorPicker
            value={element.strokeColor || '#000000'}
            onChange={(color) => onUpdate({ strokeColor: color })}
            className="w-10 h-8"
          />
          <div className="flex-1">
            <NumberInput
              value={element.strokeWidth || 0}
              onChange={(val) => onUpdate({ strokeWidth: val })}
              min={0}
              max={20}
              step={1}
              suffix=""
            />
          </div>
        </div>
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
