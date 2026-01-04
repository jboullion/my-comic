import RangeInput from '../../ui/RangeInput'

/**
 * ImageCropSection Component
 * Crop controls for image elements
 */
export default function ImageCropSection({ element, onUpdate }) {
  return (
    <>
      <RangeInput
        label="Crop X"
        value={element.cropX || 0}
        onChange={(val) => onUpdate({ cropX: val })}
        min={-1}
        max={1}
        step={0.01}
      />
      <RangeInput
        label="Crop Y"
        value={element.cropY || 0}
        onChange={(val) => onUpdate({ cropY: val })}
        min={-1}
        max={1}
        step={0.01}
      />

      <button
        onClick={() => onUpdate({ cropX: 0, cropY: 0 })}
        className="w-full py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
        type="button"
      >
        Reset Crop
      </button>
    </>
  )
}
