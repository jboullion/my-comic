import { NavLink } from 'react-router-dom'
import { FiHome, FiFolder, FiUsers, FiUser, FiLogOut, FiDownload } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import usePWAInstall from '../hooks/usePWAInstall'
import { NavLogo } from './nav'

const navItems = [
  { to: '/app', icon: FiHome, label: 'Dashboard', end: true },
  { to: '/app/projects', icon: FiFolder, label: 'Projects' },
  { to: '/app/characters', icon: FiUsers, label: 'Characters' },
]

export default function AppSidebar() {
  const { user, signOut } = useAuth()
  const { isPWAInstallable, handleInstall } = usePWAInstall()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <aside className="w-60 h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <NavLogo size="md" showText={false} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-3 border-t border-slate-800">
          {/* User Info */}
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

          {/* User Actions */}
          <div className="space-y-1">
            {isPWAInstallable && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Install App
              </button>
            )}

            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <FiUser className="w-4 h-4" />
              Profile
            </NavLink>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
