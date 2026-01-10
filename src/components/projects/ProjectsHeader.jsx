import { FiUpload, FiPlus } from 'react-icons/fi'

/**
 * ProjectsHeader Component
 * Header section with user greeting and action buttons
 */
export default function ProjectsHeader({ userName, onImport, onCreateNew }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back!
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onImport}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          title="Import project from .mycomic file"
        >
          <FiUpload className="w-5 h-5" />
          Import
        </button>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          New Project
        </button>
      </div>
    </div>
  )
}
