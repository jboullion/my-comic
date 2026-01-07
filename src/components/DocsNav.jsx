import { NavLogo, UserMenu } from './nav'

/**
 * DocsNav Component
 * Full-width navigation for documentation pages
 */
export default function DocsNav() {
  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center justify-between">
        <NavLogo size="md" />
        <UserMenu />
      </div>
    </header>
  )
}
