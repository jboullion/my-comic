import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <PublicNav />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-sm">
              Comic Book Maker v1.0 • Built with ❤️
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
                Documentation
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
