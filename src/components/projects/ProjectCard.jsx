import { Link } from 'react-router-dom'
import { FiTrash2, FiCheckCircle, FiBook } from 'react-icons/fi'
import { formatDate } from '../../lib/utils'
import { formatBytes } from '../../lib/storage'
import { useProjectSize } from '../../hooks/useProjectSize'

/**
 * ProjectCard Component
 * Display card for a single project with thumbnail and metadata
 */
export default function ProjectCard({ project, onDelete }) {
  const { size } = useProjectSize(project.id)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      await onDelete()
    }
  }

  const pageCount = project.pages?.length || 0

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden relative"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 p-1.5 bg-slate-900/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Delete project"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>

      {/* File Handle Indicator */}
      {project.fileHandle && (
        <div className="absolute top-2 left-2 z-10 p-1.5 bg-green-500/20 rounded-lg" title="Saved to file">
          <FiCheckCircle className="w-4 h-4 text-green-400" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center overflow-hidden">
        {project.pages?.[0]?.thumbnail ? (
          <img
            src={project.pages[0].thumbnail}
            alt={project.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <FiBook className="w-12 h-12 text-slate-700" />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
          {project.title}
        </h3>
        <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
          <span>
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            {size !== null && <> · {formatBytes(size)}</>}
          </span>
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
