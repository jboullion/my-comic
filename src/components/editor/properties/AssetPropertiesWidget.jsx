import { useState, useEffect } from 'react'
import { db } from '../../../lib/db'

/**
 * AssetPropertiesWidget Component
 * Display metadata and actions for selected asset
 */
export default function AssetPropertiesWidget({ assetId, onAdd }) {
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadAsset = async () => {
      setLoading(true)
      try {
        const data = await db.images.get(assetId)
        if (isMounted) {
          setAsset(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load asset metadata:', error)
        if (isMounted) setLoading(false)
      }
    }
    loadAsset()
    return () => { isMounted = false }
  }, [assetId])

  if (loading) return <div className="animate-pulse h-32 bg-slate-800 rounded-lg" />
  if (!asset) return null

  const fileSize = (asset.size / 1024).toFixed(1) + ' KB'

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Asset Properties</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Name</span>
          <span className="text-xs text-slate-200 font-medium truncate max-w-[120px]" title={asset.name}>{asset.name}</span>
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add to Canvas
        </button>
      </div>
    </div>
  )
}
