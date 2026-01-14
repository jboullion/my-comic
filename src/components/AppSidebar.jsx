import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiFolder, FiUsers, FiUser, FiLogOut, FiDownload, FiChevronsLeft, FiChevronsRight, FiMenu } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import { useAuth } from '../contexts/AuthContext'
import usePWAInstall from '../hooks/usePWAInstall'
import { useMobileDetect } from '../hooks/useMobileDetect'
import { NavLogo } from './nav'

const STORAGE_KEY = 'sidebar-collapsed'

const navItems = [
  { to: '/app', icon: FiHome, label: 'Dashboard', end: true },
  { to: '/app/series', icon: RiBookShelfFill, label: 'Series' },
  { to: '/app/projects', icon: FiFolder, label: 'Projects' },
  { to: '/app/characters', icon: FiUsers, label: 'Characters' },
]

export default function AppSidebar() {
  const { user, signOut } = useAuth()
  const { isPWAInstallable, handleInstall } = usePWAInstall()
  const { isMobile } = useMobileDetect()

  // On mobile, default to collapsed (closed)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  // Save preference (desktop only)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed))
    }
  }, [isCollapsed, isMobile])

  // On mobile, always start collapsed
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Close sidebar when clicking a nav link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }

  // Mobile: overlay menu that slides in from left
  // Desktop: normal sidebar that pushes content
  const sidebarClasses = isMobile
    ? `fixed top-0 left-0 h-screen bg-slate-950 border-r border-slate-800 flex flex-col z-50 transition-transform duration-200 w-60 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`
    : `${isCollapsed ? 'w-16' : 'w-60'} h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0 transition-all duration-200`

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile toggle button (fixed, always visible) */}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-3 left-3 z-30 p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          title="Open menu"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      )}

      <aside className={sidebarClasses}>
        {/* Logo & Toggle */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          {(!isCollapsed || isMobile) && <NavLogo size="md" showText={false} />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed && !isMobile ? 'mx-auto' : ''}`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronsRight className="w-5 h-5" /> : <FiChevronsLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleNavClick}
              title={isCollapsed && !isMobile ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isCollapsed && !isMobile ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {(!isCollapsed || isMobile) && <span className="font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-2 border-t border-slate-800">
            {/* User Info - show when expanded or on mobile */}
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* User Actions */}
            <div className="space-y-1">
              {isPWAInstallable && (
                <button
                  onClick={handleInstall}
                  title={isCollapsed && !isMobile ? 'Install App' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                >
                  <FiDownload className="w-4 h-4 shrink-0" />
                  {(!isCollapsed || isMobile) && 'Install App'}
                </button>
              )}

              <NavLink
                to="/app/profile"
                onClick={handleNavClick}
                title={isCollapsed && !isMobile ? 'Profile' : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isCollapsed && !isMobile ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <FiUser className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isMobile) && 'Profile'}
              </NavLink>

              <button
                onClick={handleSignOut}
                title={isCollapsed && !isMobile ? 'Sign Out' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
              >
                <FiLogOut className="w-4 h-4 shrink-0" />
                {(!isCollapsed || isMobile) && 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
