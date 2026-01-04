import { useState, useEffect } from 'react'
import { FiUploadCloud } from 'react-icons/fi'
import AssetThumbnail from '../ui/AssetThumbnail'
import { useAsset } from '../../../hooks/useAsset'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * AssetGallery Component
 * Grid of asset thumbnails with drag-and-drop support
 */
export default function AssetGallery({ imageIds, selectedAssetId, onSelect, onAdd }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const { addImage } = useProjectStore()

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

      for (const file of imageFiles) {
        try {
          // Only add to assets, not to canvas
          await addImage(file, { addToCanvas: false })
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      }
    }
  }

  return (
    <div
      className="space-y-4 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zone overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-10 bg-indigo-500/20 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <FiUploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm text-indigo-300 font-medium">Drop images here</p>
          </div>
        </div>
      )}

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
          <FiUploadCloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Drop images here</p>
          <p className="text-xs text-slate-600 mt-1">or drag onto the canvas</p>
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
