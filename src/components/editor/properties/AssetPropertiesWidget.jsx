import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiCheck } from 'react-icons/fi'
import { useAsset } from '../../../hooks/useAsset'
import useProjectStore from '../../../stores/useProjectStore'

/**
 * AssetPropertiesWidget Component
 * Display metadata and actions for selected asset
 */
export default function AssetPropertiesWidget({ assetId, onAdd }) {
  const asset = useAsset(assetId)
  const { renameAsset } = useProjectStore()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('')

  useEffect(() => {
    if (asset) setTempName(asset.name)
  }, [asset])

  if (!asset) return <div className="animate-pulse h-32 bg-slate-800 rounded-lg" />

  const handleRename = async () => {
    if (tempName.trim() && tempName !== asset.name) {
      await renameAsset(assetId, tempName.trim())
    }
    setIsEditing(false)
  }

  const fileSize = (asset.size / 1024).toFixed(1) + ' KB'

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Asset Properties</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-xs text-slate-400 mt-1">Name</span>
          <div className="flex-1 ml-4 flex justify-end">
            {isEditing ? (
              <div className="flex items-center gap-1 w-full">
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                />
                <button 
                  onClick={handleRename}
                  className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                <span className="text-xs text-slate-200 font-medium truncate max-w-[120px]" title={asset.name}>
                  {asset.name}
                </span>
                <FiEdit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Size</span>
          <span className="text-xs text-slate-200 font-medium">{fileSize}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Type</span>
          <span className="text-xs text-slate-200 font-medium uppercase">{asset.type.split('/')[1]}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Added</span>
          <span className="text-xs text-slate-200 font-medium">
            {new Date(asset.createdAt).toLocaleDateString()}
          </span>
        </div>

        <button 
          onClick={() => onAdd(assetId)}
          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add to Canvas
        </button>
      </div>
    </div>
  )
}
