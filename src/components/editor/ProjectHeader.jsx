import { Link } from 'react-router-dom'
import { FiChevronLeft, FiCheck, FiDownload } from 'react-icons/fi'
import EditableTitle from './ui/EditableTitle'

/**
 * ProjectHeader Component
 * Top header bar with project title, save controls, and navigation
 */
export default function ProjectHeader({ 
  project, 
  hasUnsavedChanges, 
  isSaving,
  onTitleChange,
  onSave,
  onSaveToFile
}) {
  return (
    <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900">
      <div className="flex items-center gap-4">
        <Link 
          to="/projects"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <EditableTitle 
            title={project.title} 
            onSave={onTitleChange}
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-500">• Unsaved</span>
          )}
          {project.fileHandle && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <FiCheck className="w-3 h-3" />
              Saved to file
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={onSaveToFile}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <FiDownload className="w-4 h-4" />
          Save As
        </button>
        <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors">
          Export
        </button>
      </div>
    </div>
  )
}
