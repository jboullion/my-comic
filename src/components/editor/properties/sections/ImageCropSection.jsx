/**
 * ImageCropSection Component
 * Crop controls for image elements
 */
export default function ImageCropSection({ element, onUpdate }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Crop X</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.cropX || 0}
            onChange={(e) => onUpdate({ cropX: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Crop Y</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.cropY || 0}
            onChange={(e) => onUpdate({ cropY: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Crop Width</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={element.cropWidth || 1}
            onChange={(e) => onUpdate({ cropWidth: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold">Crop Height</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={element.cropHeight || 1}
            onChange={(e) => onUpdate({ cropHeight: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={() => onUpdate({ cropX: 0, cropY: 0, cropWidth: 1, cropHeight: 1 })}
        className="w-full py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
        type="button"
      >
        Reset Crop
      </button>
    </>
  )
}
