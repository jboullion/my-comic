import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PublicNav() {
  const { user } = useAuth()

  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <NavLogo size="lg" />
        <div className="flex items-center gap-6">
          <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
            Documentation
          </Link>
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
