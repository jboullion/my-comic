import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiTrash2, FiFolder, FiUsers } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import { formatDate } from '../../lib/utils'

/**
 * SeriesCard Component
 * Display card for a single series with counts
 */
export default function SeriesCard({ series, onEdit, onDelete }) {
  // Create URL for cover image blob
  const coverImageUrl = useMemo(() => {
    if (series.coverImage?.blob) {
      return URL.createObjectURL(series.coverImage.blob)
    }
    return null
  }, [series.coverImage])
  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent deleting Uncategorized
    if (series.name === 'Uncategorized') {
      alert('Cannot delete the Uncategorized series.')
      return
    }

    if (window.confirm(`Delete "${series.name}"? Projects and characters will be moved to Uncategorized.`)) {
      await onDelete(series.id)
    }
  }

  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(series)
  }

  return (
    <Link
      to={`/app/series/${series.id}`}
      className="group block bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden relative"
    >
      {/* Delete Button (hidden for Uncategorized) */}
      {series.name !== 'Uncategorized' && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-10 p-1.5 bg-slate-900/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="Delete series"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}

      {/* Header with Cover Image or Icon */}
      <div className="aspect-[16/9] bg-slate-800 flex items-center justify-center overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={series.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <RiBookShelfFill className="w-16 h-16 text-slate-600" />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
          {series.name}
        </h3>
        {series.description && (
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{series.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <FiFolder className="w-3.5 h-3.5" />
            {series.projectCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers className="w-3.5 h-3.5" />
            {series.characterCount || 0}
          </span>
          <span className="ml-auto">{formatDate(series.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
