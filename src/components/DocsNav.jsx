import { useState } from 'react'
import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMenu } from 'react-icons/fi'
import MobileNav from './nav/MobileNav'

/**
 * DocsNav Component
 * Full-width navigation for documentation pages
 */
export default function DocsNav() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Build navigation links
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Pricing', to: '/pricing' },
  ]

  if (user) {
    navLinks.push({ label: 'Dashboard', to: '/app' })
  }

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <NavLogo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            {user && (
              <Link to="/app" className="text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side - Mobile menu button + User menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-400 hover:text-white transition-colors p-2"
              aria-label="Open menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
      />
    </>
  )
}
