import { FiStar, FiTrash2 } from 'react-icons/fi'
import { useHistoryThumbnailUrl } from '../../../hooks/useHistoryThumbnailUrl'
import type { GenerationHistoryEntry } from '../../../lib/generationHistory'

interface HistoryThumbnailItemProps {
  entry: GenerationHistoryEntry
  onSelect: () => void
  onTogglePin: () => void
  onDelete: () => void
  modelName?: string
  styleName?: string
}

/**
 * Format timestamp to relative time (e.g., "2h ago", "3d ago")
 */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Individual history thumbnail item for the gallery
 */
export default function HistoryThumbnailItem({
  entry,
  onSelect,
  onTogglePin,
  onDelete,
  modelName,
  styleName
}: HistoryThumbnailItemProps) {
  const thumbnailUrl = useHistoryThumbnailUrl(entry)

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePin()
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer group border border-slate-700 hover:border-indigo-500 transition-all"
    >
      {/* Thumbnail Image */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Generated"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-slate-700" />
      )}

      {/* Pin Badge (top-left) */}
      <button
        onClick={handlePinClick}
        className={`absolute top-1.5 left-1.5 p-1 rounded-md transition-all ${
          entry.pinned
            ? 'bg-amber-500 text-white'
            : 'bg-slate-900/70 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400'
        }`}
        title={entry.pinned ? 'Unpin' : 'Pin (never delete)'}
      >
        <FiStar
          className={`w-3.5 h-3.5 ${entry.pinned ? 'fill-current' : ''}`}
        />
      </button>

      {/* Delete Button (top-right, hover only) */}
      <button
        onClick={handleDeleteClick}
        className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/70 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/20 transition-all"
        title="Delete"
      >
        <FiTrash2 className="w-3.5 h-3.5" />
      </button>

      {/* Info Overlay (bottom, on hover) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Prompt preview */}
        <p className="text-[10px] text-white line-clamp-2 leading-tight mb-1.5">
          {entry.prompt}
        </p>

        {/* Tags row */}
        <div className="flex items-center gap-1 flex-wrap">
          {styleName && (
            <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/30 text-indigo-200 rounded">
              {styleName}
            </span>
          )}
          {modelName && (
            <span className="px-1.5 py-0.5 text-[9px] bg-slate-700/80 text-slate-300 rounded">
              {modelName}
            </span>
          )}
          <span className="text-[9px] text-slate-400 ml-auto">
            {formatTimeAgo(entry.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}
