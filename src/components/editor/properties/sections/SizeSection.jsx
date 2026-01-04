import { FiLock, FiUnlock } from 'react-icons/fi'
import NumberInput from '../../ui/NumberInput'

/**
 * SizeSection Component
 * Dimension controls (Width, Height) with optional aspect ratio lock
 */
export default function SizeSection({ element, onUpdate }) {
  const isImage = element.type === 'image'
  const lockAspectRatio = element.lockAspectRatio ?? false
  const aspectRatio = element.width / element.height

  const handleWidthChange = (val) => {
    if (lockAspectRatio && isImage) {
      const newHeight = Math.round(val / aspectRatio)
      onUpdate({ width: val, height: newHeight })
    } else {
      onUpdate({ width: val })
    }
  }

  const handleHeightChange = (val) => {
    if (lockAspectRatio && isImage) {
      const newWidth = Math.round(val * aspectRatio)
      onUpdate({ width: newWidth, height: val })
    } else {
      onUpdate({ height: val })
    }
  }

  const toggleLock = () => {
    onUpdate({ lockAspectRatio: !lockAspectRatio })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Width"
          value={Math.round(element.width)}
          onChange={handleWidthChange}
          min={1}
          step={1}
        />
        <NumberInput
          label="Height"
          value={Math.round(element.height)}
          onChange={handleHeightChange}
          min={1}
          step={1}
        />
      </div>

      {/* Lock aspect ratio toggle - only for images */}
      {isImage && (
        <button
          onClick={toggleLock}
          className={`flex items-center gap-2 text-xs transition-colors ${
            lockAspectRatio
              ? 'text-indigo-400 hover:text-indigo-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          type="button"
        >
          {lockAspectRatio ? (
            <FiLock className="w-3.5 h-3.5" />
          ) : (
            <FiUnlock className="w-3.5 h-3.5" />
          )}
          {lockAspectRatio ? 'Aspect ratio locked' : 'Lock aspect ratio'}
        </button>
      )}
    </div>
  )
}
