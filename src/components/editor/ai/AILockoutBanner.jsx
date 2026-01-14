import { FiAlertCircle } from 'react-icons/fi'

/**
 * Banner displayed when image generation is restricted
 */
export default function AILockoutBanner({ isRestricted, message }) {
  if (!isRestricted || !message) return null

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-red-300 font-medium">Image Generation Restricted</p>
          <p className="text-xs text-red-300/70 mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}
