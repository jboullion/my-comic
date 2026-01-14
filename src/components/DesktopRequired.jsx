import { Link } from 'react-router-dom'
import { FiMonitor } from 'react-icons/fi'

export default function DesktopRequired() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiMonitor className="w-10 h-10 text-indigo-400" />
        </div>

        <h1 className="text-2xl font-bold mb-3">
          Desktop Browser Required
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Comic Book Maker's editor needs a larger screen to work properly.
          Please visit on a desktop or laptop computer.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
