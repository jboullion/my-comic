import { FiPlus } from 'react-icons/fi'
import PageThumbnail from './ui/PageThumbnail'

/**
 * PagesSidebar Component
 * Left sidebar with page navigation and thumbnail list
 */
export default function PagesSidebar({ pages, activePageIndex, onPageSelect, onAddPage }) {
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
          />
        ))}
      </div>
    </aside>
  )
}
