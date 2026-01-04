import { useState, useEffect } from 'react'
import AssetThumbnail from '../ui/AssetThumbnail'
import { useAsset } from '../../../hooks/useAsset'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * AssetGallery Component
 * Grid of asset thumbnails with drag-and-drop support
 */
export default function AssetGallery({ imageIds, selectedAssetId, onSelect, onAdd }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {imageIds.map(id => (
          <AssetItem 
            key={id}
            id={id}
            selected={selectedAssetId === id}
            onSelect={onSelect}
            onAdd={onAdd}
          />
        ))}
      </div>
      {imageIds.length === 0 && (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-800 rounded-xl">
          <p className="text-sm text-slate-500">No assets uploaded yet.</p>
        </div>
      )}
    </div>
  )
}

/**
 * AssetItem Component
 * Individual asset with rename capability
 */
function AssetItem({ id, selected, onSelect, onAdd }) {
  const asset = useAsset(id)
  const { renameAsset } = useProjectStore()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('')

  useEffect(() => {
    if (asset) setTempName(asset.name)
  }, [asset])

  const handleRename = async () => {
    if (tempName.trim() && tempName !== asset.name) {
      try {
        await renameAsset(id, tempName.trim())
      } catch (error) {
        setTempName(asset.name)
      }
    } else {
      setTempName(asset?.name || '')
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-1">
      <button 
        onClick={() => onSelect(id)}
        onDoubleClick={() => onAdd(id)}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('assetId', id)
          e.dataTransfer.effectAllowed = 'copy'
        }}
        className={`w-full aspect-square bg-slate-800 rounded-lg border overflow-hidden transition-all group relative ${
          selected 
            ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
            : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        <AssetThumbnail assetId={id} />
        <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
      </button>
      
      {isEditing ? (
        <input
          autoFocus
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="w-full bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 text-[10px] text-white focus:outline-none"
        />
      ) : (
        <div 
          className="text-[10px] text-slate-400 truncate px-1 cursor-pointer hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          title="Click to rename"
        >
          {asset?.name || 'Loading...'}
        </div>
      )}
    </div>
  )
}
