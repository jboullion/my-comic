/**
 * MobileNav Component
 * Dropdown navigation menu for mobile devices
 * Similar pattern to UserMenu - appears below the menu button
 */
export default function MobileNav({ isOpen, onClose, links }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
        <div className="py-1">
          {links.map((link) => (
            <a
              key={link.to}
              href={link.to}
              onClick={(e) => {
                e.preventDefault()
                onClose()
                // Use window.location for navigation to ensure it works
                window.location.href = link.to
              }}
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
