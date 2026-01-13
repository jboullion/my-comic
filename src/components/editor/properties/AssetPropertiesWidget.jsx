import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiCheck, FiTrash2, FiCpu, FiCopy } from 'react-icons/fi'
import { useAsset } from '../../../hooks/useAsset'
import { useImageUrl } from '../../../hooks/useImage'
import useProjectStore from '../../../stores/useProjectStore'
import { AI_STYLES, AI_MODELS } from '../../../lib/ai/falai'

/**
 * AssetPropertiesWidget Component
 * Display metadata and actions for selected asset
 */
export default function AssetPropertiesWidget({ assetId, onAdd, showInPopup = false }) {
  const asset = useAsset(assetId)
  const imageUrl = useImageUrl(assetId)
  const { renameAsset, deleteAsset, isAssetUsed } = useProjectStore()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleDeleteClick = () => {
    const inUse = isAssetUsed(assetId)
    if (inUse) {
      setShowDeleteConfirm(true)
    } else {
      // Not in use, delete directly
      deleteAsset(assetId)
    }
  }

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false)
    await deleteAsset(assetId)
  }

  const fileSize = (asset.size / 1024).toFixed(1) + ' KB'

  return (
    <div className={showInPopup
      ? "p-6" // Padding for popup
      : "bg-slate-900/50 rounded-xl p-4 border border-slate-800" // Inline styling
    }>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Asset Properties</h3>

      {/* Thumbnail preview (only in popup) */}
      {showInPopup && (
        <div className="mb-4 flex justify-center items-center min-h-25">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={asset.name}
              className="max-w-50 max-h-50 rounded-lg border border-slate-700 object-contain bg-slate-950"
            />
          ) : (
            <div className="w-25 h-25 rounded-lg border border-slate-700 bg-slate-950 animate-pulse" />
          )}
        </div>
      )}

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
        {asset.width && asset.height && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Dimensions</span>
            <span className="text-xs text-slate-200 font-medium">{asset.width} × {asset.height}</span>
          </div>
        )}
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

        {/* AI Generated Section */}
        {asset.aiPrompt && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <FiCpu className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Generated</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Prompt</span>
                <p className="text-xs text-slate-300 bg-slate-800 rounded-lg p-2 line-clamp-3">
                  {asset.aiPrompt}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(asset.aiPrompt)}
                  className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <FiCopy className="w-3 h-3" />
                  Copy Prompt
                </button>
              </div>

              {asset.aiStyle && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Style</span>
                  <span className="text-xs text-slate-200 font-medium">
                    {AI_STYLES[asset.aiStyle]?.name || asset.aiStyle}
                  </span>
                </div>
              )}

              {asset.aiModel && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Model</span>
                  <span className="text-xs text-slate-200 font-medium">
                    {AI_MODELS[asset.aiModel]?.name || asset.aiModel}
                  </span>
                </div>
              )}

              {asset.aiSeed && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Seed</span>
                  <span className="text-xs text-slate-200 font-mono">{asset.aiSeed}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onAdd(assetId)}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add to Canvas
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-3 py-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors"
            title="Delete asset"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Asset?</h3>
            <p className="text-sm text-slate-400 mb-4">
              Are you sure? This will remove this asset from all pages where it is used.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
