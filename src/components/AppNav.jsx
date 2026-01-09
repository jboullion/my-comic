import { NavLogo, UserMenu } from './nav'
import { Link } from 'react-router-dom'

export default function AppNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <NavLogo size="md" showText={false} />
        <div className="flex items-center gap-6">
          <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
            Documentation
          </Link>
        </div>
        <UserMenu showLoading={false} showSignIn={false} />
      </div>
    </header>
  )
}
