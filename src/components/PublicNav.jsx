import { useState } from 'react'
import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMenu } from 'react-icons/fi'
import MobileNav from './nav/MobileNav'

export default function PublicNav({ fullWidth = false }) {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Build navigation links
  const navLinks = [
    { label: 'Documentation', to: '/docs' },
    // { label: 'Pricing', to: '/pricing' },
  ]

  if (user) {
    navLinks.push({ label: 'Dashboard', to: '/app' })
  }

  const containerClasses = fullWidth
    ? 'px-6 py-4 flex items-center justify-between'
    : 'max-w-6xl mx-auto px-4 py-4 flex items-center justify-between'

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className={containerClasses}>
          <NavLogo size="lg" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
              Documentation
            </Link>
            {/* <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link> */}
          </div>

          {/* Right side - Mobile menu button + Dashboard + User menu */}
          <div className="flex items-center gap-3">
            {/* Mobile menu dropdown */}
            <div className="relative md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-400 hover:text-white transition-colors p-2"
                aria-label="Open menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <MobileNav
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                links={navLinks}
              />
            </div>
            {user && (
              <Link
                to="/app"
                className="hidden md:inline-flex px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                Dashboard
              </Link>
            )}
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  )
}
