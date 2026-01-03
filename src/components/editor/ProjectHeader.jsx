import { Link } from 'react-router-dom'
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
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
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save As
        </button>
        <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors">
          Export
        </button>
      </div>
    </div>
  )
}
