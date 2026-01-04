import { FiMenu } from 'react-icons/fi'
import AssetThumbnail from '../ui/AssetThumbnail'
import { useAsset } from '../../../hooks/useAsset'
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
          <LayerItem 
            key={el.id}
            element={el}
            index={currentPage.elements.length - idx}
            reversedIdx={reversedIdx}
            selected={selectedElementIds.includes(el.id)}
            onSelect={onSelectElement}
            onReorder={(sourceIndex, targetIndex) => {
              const elements = [...currentPage.elements]
              const [removed] = elements.splice(sourceIndex, 1)
              elements.splice(targetIndex, 0, removed)
              
              updateCurrentProjectLocal({
                pages: currentProject.pages.map((p, i) => 
                  i === activePageIndex ? { ...p, elements } : p
                )
              })
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * LayerItem Component
 */
function LayerItem({ element, index, reversedIdx, selected, onSelect, onReorder }) {
  const asset = useAsset(element.type === 'image' ? element.assetId : null)
  
  const label = element.type === 'image' 
    ? (asset?.name || 'Image') 
    : (element.type.charAt(0).toUpperCase() + element.type.slice(1))

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('elementId', element.id)
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
        
        if (sourceId && sourceId !== element.id) {
          onReorder(sourceIndex, reversedIdx)
        }
      }}
      onClick={() => onSelect(element.id)}
      className={`p-2 rounded-lg border flex items-center gap-3 cursor-move transition-all ${
        selected 
          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
          : 'bg-slate-800/30 border-transparent hover:border-slate-700 text-slate-400'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          {element.type === 'image' ? (
            <AssetThumbnail assetId={element.assetId} />
          ) : (
            <span className="text-[10px] uppercase font-bold">{element.type.charAt(0)}</span>
          )}
        </div>
        <span className="text-xs font-medium truncate">
          {label} {element.type !== 'image' && index}
        </span>
      </div>
      <FiMenu className="w-4 h-4 text-slate-600 flex-shrink-0" />
    </div>
  )
}
