import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'

export default function PublicNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <NavLogo size="lg" />
          <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
            Documentation
          </Link>
        <UserMenu />
      </div>
    </header>
  )
}
