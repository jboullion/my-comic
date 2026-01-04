import { FiLock, FiUnlock, FiRotateCcw } from 'react-icons/fi'
import NumberInput from '../../ui/NumberInput'
import { useAsset } from '../../../../hooks/useAsset'

/**
 * SizeSection Component
 * Dimension controls (Width, Height) with optional aspect ratio lock
 */
export default function SizeSection({ element, onUpdate }) {
  const isImage = element.type === 'image'
  const lockAspectRatio = element.lockAspectRatio ?? false
  const aspectRatio = element.width / element.height

  // Get original asset dimensions for reset
  const asset = useAsset(element.assetId)

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

  const handleReset = () => {
    if (asset?.width && asset?.height) {
      onUpdate({ width: asset.width, height: asset.height })
    }
  }

  return (
    <div className="space-y-3">
      {isImage ? (
        // Image layout: Width - Lock - Height in a row
        <div className="flex items-end  gap-2">
          <div className="w-26">
            <NumberInput
              label="Width"
              value={Math.round(element.width)}
              onChange={handleWidthChange}
              min={1}
              step={1}
            />
          </div>
          <button
            onClick={toggleLock}
            className={`flex items-center justify-center w-8 h-8 mb-0.5 rounded transition-colors ${
              lockAspectRatio
                ? 'text-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/30'
                : 'text-slate-500 bg-slate-700/50 hover:bg-slate-700'
            }`}
            type="button"
            title={lockAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            {lockAspectRatio ? (
              <FiLock className="w-4 h-4" />
            ) : (
              <FiUnlock className="w-4 h-4" />
            )}
          </button>
          <div className="w-26">
            <NumberInput
              label="Height"
              value={Math.round(element.height)}
              onChange={handleHeightChange}
              min={1}
              step={1}
            />
          </div>
        </div>
      ) : (
        // Non-image layout: standard 2-column grid
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
      )}

      {/* Reset button - only for images with original dimensions */}
      {isImage && asset?.width && asset?.height && (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          type="button"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
          Reset size ({asset.width} × {asset.height})
        </button>
      )}
    </div>
  )
}
