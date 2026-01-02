import { Link, useLocation } from 'react-router-dom'
import PublicNav from '../components/PublicNav'

const docsSections = [
  { title: 'Getting Started', path: '/docs', icon: '🚀' },
  { title: 'Panel Layouts', path: '/docs/panels', icon: '📐' },
  { title: 'Adding Images', path: '/docs/images', icon: '🖼️' },
  { title: 'Text & Bubbles', path: '/docs/text', icon: '💬' },
  { title: 'Saving Projects', path: '/docs/saving', icon: '💾' },
  { title: 'Keyboard Shortcuts', path: '/docs/shortcuts', icon: '⌨️' },
]

export default function DocsLayout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <PublicNav />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-slate-800 p-6">
          <nav className="space-y-1 sticky top-24">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Documentation
            </h3>
            {docsSections.map((section) => (
              <Link
                key={section.path}
                to={section.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname === section.path
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl px-6 py-8 lg:px-12">
          {children}
        </main>

        {/* Right Sidebar (Table of Contents placeholder) */}
        <aside className="hidden xl:block w-56 p-6">
          <div className="sticky top-24">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              On This Page
            </h3>
            <p className="text-sm text-slate-600">
              {/* TOC will be generated from page headings */}
            </p>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-sm">
              Comic Book Maker v1.0 • Built with ❤️
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
