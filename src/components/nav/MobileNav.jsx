import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'

/**
 * MobileNav Component
 * Reusable mobile navigation menu with slide-in overlay
 * Used by PublicNav and DocsNav for responsive navigation
 */
export default function MobileNav({ isOpen, onClose, links }) {
  // Handle ESC key to close menu
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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Slide-in Menu */}
      <div className="fixed top-0 right-0 bottom-0 w-64 bg-slate-800 border-l border-slate-700 z-50 md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <div className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
