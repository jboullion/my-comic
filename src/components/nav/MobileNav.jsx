import { Link, useLocation } from 'react-router-dom'
import { FiX } from 'react-icons/fi'

/**
 * MobileNav Component
 * Slide-in navigation menu for mobile devices
 * Supports both simple links and grouped sections
 */
export default function MobileNav({ isOpen, onClose, links = [], sections = [] }) {
  const location = useLocation()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-950 border-r border-slate-800 z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-lg font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto max-h-[calc(100vh-65px)]">
          {/* Simple Links */}
          {links.length > 0 && (
            <div className="space-y-1 mb-6">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="block px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Grouped Sections */}
          {sections.length > 0 && (
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.group}>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                    {section.group}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
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
          )}
        </nav>
      </div>
    </>
  )
}
