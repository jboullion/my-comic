import { useRef, useEffect, useCallback } from 'react'
import { FiClock, FiLoader } from 'react-icons/fi'
import HistoryThumbnailItem from './ui/HistoryThumbnailItem'
import type { GenerationHistoryEntry } from '../../lib/generationHistory'

interface HistoryGalleryProps {
  entries: GenerationHistoryEntry[]
  isLoading: boolean
  hasMore: boolean
  totalCount: number
  onLoadMore: () => void
  onSelect: (entry: GenerationHistoryEntry) => void
  onTogglePin: (id: number) => void
  onDelete: (id: number) => void
  onClearAll: () => void
  getModelName?: (model: string) => string
  getStyleName?: (style: string | null) => string
}

/**
 * Gallery grid for AI generation history with infinite scroll
 */
export default function HistoryGallery({
  entries,
  isLoading,
  hasMore,
  totalCount,
  onLoadMore,
  onSelect,
  onTogglePin,
  onDelete,
  onClearAll,
  getModelName,
  getStyleName
}: HistoryGalleryProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll with IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [handleObserver])

  // Empty state
  if (entries.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <FiClock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-slate-400">No generation history yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Generated images will appear here
        </p>
      </div>
    )
  }

  const pinnedCount = entries.filter(e => e.pinned).length

  return (
    <div className="space-y-4">
      {/* Count header */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {totalCount} generation{totalCount !== 1 ? 's' : ''}
            {pinnedCount > 0 && (
              <span className="ml-1 text-amber-500">
                ({pinnedCount} pinned)
              </span>
            )}
          </span>
          {entries.length < totalCount && (
            <span>Showing {entries.length}</span>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-3">
        {entries.map((entry) => (
          <HistoryThumbnailItem
            key={entry.id}
            entry={entry}
            onSelect={() => onSelect(entry)}
            onTogglePin={() => onTogglePin(entry.id!)}
            onDelete={() => onDelete(entry.id!)}
            modelName={getModelName?.(entry.model)}
            styleName={getStyleName?.(entry.style)}
          />
        ))}
      </div>

      {/* Load more trigger / Loading indicator */}
      <div ref={loadMoreRef} className="py-2 flex justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500">
            <FiLoader className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
        {!isLoading && hasMore && (
          <span className="text-xs text-slate-600">Scroll for more</span>
        )}
      </div>

      {/* Clear All Button */}
      {entries.length > 0 && (
        <div className="pt-4 border-t border-slate-700">
          <button
            onClick={onClearAll}
            className="w-full px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear All History {pinnedCount > 0 && '(keeps pinned)'}
          </button>
        </div>
      )}
    </div>
  )
}
