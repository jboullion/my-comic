import { NavLogo, UserMenu } from './nav'

export default function AppNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <NavLogo size="md" showText={false} />
        <UserMenu showLoading={false} showSignIn={false} />
      </div>
    </header>
  )
}
