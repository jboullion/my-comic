import { Link } from 'react-router-dom'

export default function AppFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="text-slate-600">
            Comic Book Maker v1.0
          </div>
          <div className="flex gap-4">
            <Link to="/docs" className="text-slate-500 hover:text-slate-300 transition-colors">
              Help
            </Link>
            <Link to="/contact" className="text-slate-500 hover:text-slate-300 transition-colors">
              Feedback
            </Link>
            <Link to="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
