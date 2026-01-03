import AssetThumbnail from '../ui/AssetThumbnail'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * LayersPanel Component
 * List of elements on the current page with drag-to-reorder
 */
export default function LayersPanel({ currentPage, activePageIndex, selectedElementIds, onSelectElement }) {
  const { updateCurrentProjectLocal, currentProject } = useProjectStore()

  if (!currentPage?.elements || currentPage.elements.length === 0) {
    return (
      <p className="text-center text-slate-500 text-sm py-8">No elements on this page</p>
    )
  }

  return (
    <div className="space-y-2">
      {currentPage.elements.slice().reverse().map((el, idx) => {
        const reversedIdx = currentPage.elements.length - idx - 1
        return (
          <div 
            key={el.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('elementId', el.id)
              e.dataTransfer.setData('sourceIndex', reversedIdx.toString())
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const sourceId = e.dataTransfer.getData('elementId')
              const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'))
              
              if (sourceId && sourceId !== el.id) {
                // Reorder by moving source element to target position
                const elements = [...currentPage.elements]
                const [removed] = elements.splice(sourceIndex, 1)
                elements.splice(reversedIdx, 0, removed)
                
                updateCurrentProjectLocal({
                  pages: currentProject.pages.map((p, i) => 
                    i === activePageIndex ? { ...p, elements } : p
                  )
                })
              }
            }}
            onClick={() => onSelectElement(el.id)}
            className={`p-2 rounded-lg border flex items-center gap-3 cursor-move transition-all ${
              selectedElementIds.includes(el.id) 
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                : 'bg-slate-800/30 border-transparent hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                {el.type === 'image' ? (
                  <AssetThumbnail assetId={el.assetId} />
                ) : (
                  <span className="text-[10px] uppercase font-bold">{el.type.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs font-medium truncate">
                {el.type.charAt(0).toUpperCase() + el.type.slice(1)} {currentPage.elements.length - idx}
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
