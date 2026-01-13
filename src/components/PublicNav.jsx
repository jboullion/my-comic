import { useState } from 'react'
import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMenu } from 'react-icons/fi'
import MobileNav from './nav/MobileNav'

export default function PublicNav() {
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

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <NavLogo size="lg" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
              Documentation
            </Link>
            {/* <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link> */}
            {user && (
              <Link to="/app" className="text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side - Mobile menu button + User menu */}
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
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  )
}
