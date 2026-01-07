import { FiFolder } from 'react-icons/fi'

/**
 * EmptyState Component
 * Displayed when user has no projects yet
 */
export default function EmptyState({ onCreateNew, onOpenFile }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiFolder className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
      <p className="text-slate-400 mb-6">Create your first comic book project to get started.</p>
      <div className="flex items-center justify-center gap-3">
        <button 
          onClick={onOpenFile}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
        >
          Open Existing
        </button>
        <button 
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
        >
          Create New Project
        </button>
      </div>
    </div>
  )
}
