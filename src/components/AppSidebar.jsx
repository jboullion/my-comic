import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiFolder, FiUsers, FiUser, FiLogOut, FiDownload, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import { useAuth } from '../contexts/AuthContext'
import usePWAInstall from '../hooks/usePWAInstall'
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-60'} h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0 transition-all duration-200`}>
      {/* Logo & Toggle */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && <NavLogo size="md" showText={false} />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
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
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-2 border-t border-slate-800">
          {/* User Info - only show when expanded */}
          {!isCollapsed && (
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
                title={isCollapsed ? 'Install App' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
              >
                <FiDownload className="w-4 h-4 shrink-0" />
                {!isCollapsed && 'Install App'}
              </button>
            )}

            <NavLink
              to="/app/profile"
              title={isCollapsed ? 'Profile' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <FiUser className="w-4 h-4 shrink-0" />
              {!isCollapsed && 'Profile'}
            </NavLink>

            <button
              onClick={handleSignOut}
              title={isCollapsed ? 'Sign Out' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            >
              <FiLogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
