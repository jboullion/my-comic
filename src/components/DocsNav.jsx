import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * DocsNav Component
 * Full-width navigation for documentation pages
 */
export default function DocsNav() {
   const { user } = useAuth()
  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center justify-between">
        <NavLogo size="md" />
        <div className="flex items-center gap-6">
        {user && (
          <Link to="/app" className="text-slate-400 hover:text-white transition-colors">
            Dashboard
          </Link>
        )}
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
