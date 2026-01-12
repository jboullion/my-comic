import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'

/**
 * InfoModal
 *
 * Reusable modal for informational messages, confirmations, and "Coming Soon" notices.
 * Features ESC key support and backdrop click to close.
 */
export default function InfoModal({ isOpen, onClose, title, message, actionButton }) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - NO backdrop-blur per CLAUDE.md */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-slate-300 leading-relaxed">{message}</p>
        </div>

        {/* Footer with action button */}
        {actionButton && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
            {actionButton.link ? (
              <Link
                to={actionButton.link}
                onClick={onClose}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
              >
                {actionButton.text}
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (actionButton.onClick) actionButton.onClick()
                  onClose()
                }}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
              >
                {actionButton.text}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
