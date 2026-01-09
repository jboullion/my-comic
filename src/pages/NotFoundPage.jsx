import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'
import PublicLayout from '../layouts/PublicLayout'

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h1 className="text-8xl font-bold text-indigo-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors text-white"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors text-white"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </PublicLayout>
  )
}
