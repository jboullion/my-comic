import { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import PageThumbnail from './ui/PageThumbnail'

/**
 * PagesSidebar Component
 * Left sidebar with page navigation and drag-to-reorder thumbnails
 */
export default function PagesSidebar({ pages, activePageIndex, onPageSelect, onAddPage, onReorderPages }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(null)

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dropTargetIndex !== null && draggedIndex !== dropTargetIndex) {
      onReorderPages?.(draggedIndex, dropTargetIndex)
    }
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex !== null && index !== draggedIndex) {
      setDropTargetIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDropTargetIndex(null)
  }

  return (
    <aside className="w-48 shrink-0 border-r border-slate-800 p-3 overflow-y-auto bg-slate-900">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase">Pages</span>
        <button
          onClick={onAddPage}
          className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Add page"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Page Thumbnails */}
      <div className="space-y-2">
        {pages.map((page, index) => (
          <PageThumbnail
            key={page.id || index}
            pageNumber={index + 1}
            isActive={activePageIndex === index}
            onClick={() => onPageSelect(index)}
            thumbnail={page.thumbnail}
            isDragging={draggedIndex === index}
            isDropTarget={dropTargetIndex === index}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
          />
        ))}
      </div>
    </aside>
  )
}
