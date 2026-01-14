import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiX, FiBook } from 'react-icons/fi'
import { docsSections } from './docsSections'

const MOBILE_BREAKPOINT = 1024 // lg breakpoint

/**
 * DocsSidebar Component
 * Documentation navigation sidebar
 * - Desktop: Always visible, static sidebar
 * - Mobile/Tablet: Flyout overlay menu
 */
export default function DocsSidebar() {
  const location = useLocation()

  // Check if we're on a narrow screen (below lg breakpoint)
  const [isNarrowScreen, setIsNarrowScreen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Listen for resize events
  useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < MOBILE_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close menu when clicking a nav link on narrow screens
  const handleNavClick = () => {
    if (isNarrowScreen) {
      setIsMenuOpen(false)
    }
  }

  // Navigation content (shared between desktop and mobile)
  const NavContent = () => (
    <div className="space-y-6">
      {docsSections.map((section) => (
        <div key={section.group}>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            {section.group}
          </h4>
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // Desktop: Static sidebar (hidden on narrow screens via CSS)
  // Mobile: Flyout overlay
  return (
    <>
      {/* Desktop Sidebar - always visible on lg+ screens */}
      <aside className="hidden lg:block w-64 border-r border-slate-800 p-6 shrink-0">
        <nav className="sticky top-24 space-y-6">
          <NavContent />
        </nav>
      </aside>

      {/* Mobile: Menu button */}
      {isNarrowScreen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-20 left-3 z-30 p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
          title="Open docs menu"
        >
          <FiBook className="w-5 h-5" />
          <span className="text-sm font-medium">Docs</span>
        </button>
      )}

      {/* Mobile: Backdrop */}
      {isNarrowScreen && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile: Flyout menu */}
      {isNarrowScreen && (
        <div
          className={`fixed top-0 left-0 h-screen w-72 bg-slate-950 border-r border-slate-800 z-50 transition-transform duration-200 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Documentation
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 overflow-y-auto max-h-[calc(100vh-65px)]">
            <NavContent />
          </nav>
        </div>
      )}
    </>
  )
}
