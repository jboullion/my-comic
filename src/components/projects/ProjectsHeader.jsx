import { FiUpload, FiPlus, FiFolder } from 'react-icons/fi'

/**
 * ProjectsHeader Component
 * Header section with user greeting and action buttons
 */
export default function ProjectsHeader({ userName, onImport, onCreateNew }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
          <FiFolder className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-slate-400 text-sm">
            All your comic book projects
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onImport}
          className="flex-1 sm:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          title="Import project from .mycomic file"
        >
          <FiUpload className="w-5 h-5" />
          Import
        </button>
        <button
          onClick={onCreateNew}
          className="flex-1 sm:flex-none px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          New Project
        </button>
      </div>
    </div>
  )
}
