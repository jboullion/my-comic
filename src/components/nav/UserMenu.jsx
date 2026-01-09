import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiDownload, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import usePWAInstall from '../../hooks/usePWAInstall'
import LoginModal from '../auth/LoginModal'

/**
 * UserMenu Component
 * Dropdown menu for authenticated users with avatar, profile links, and sign out
 *
 * @param {boolean} showSignIn - Show "Sign In" button when logged out (default: true)
 * @param {boolean} showLoading - Show loading state while auth is loading (default: true)
 */
export default function UserMenu({ showSignIn = true, showLoading = true }) {
  const { user, loading, signOut } = useAuth()
  const { isPWAInstallable, handleInstall } = usePWAInstall()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Loading state
  if (loading && showLoading) {
    return <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
  }

  // Not logged in
  if (!user) {
    if (!showSignIn) return null
    return (
      <>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors text-white"
        >
          Sign In
        </button>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    )
  }

  // Logged in - show dropdown
  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img
          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`}
          alt="Avatar"
          className="w-8 h-8 rounded-full border-2 border-slate-700"
        />
        <FiChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-white truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {isPWAInstallable && (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleInstall()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                >
                  <FiDownload className="w-4 h-4" />
                  Install App
                </button>
              )}

              <Link
                to="/app/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <FiUser className="w-4 h-4" />
                Profile
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false)
                  handleSignOut()
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
