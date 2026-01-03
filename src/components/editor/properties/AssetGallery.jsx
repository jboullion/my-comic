import AssetThumbnail from '../ui/AssetThumbnail'

/**
 * AssetGallery Component
 * Grid of asset thumbnails with drag-and-drop support
 */
export default function AssetGallery({ imageIds, selectedAssetId, onSelect, onAdd }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {imageIds.map(id => (
          <button 
            key={id}
            onClick={() => onSelect(id)}
            onDoubleClick={() => onAdd(id)}
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData('assetId', id)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            className={`aspect-square bg-slate-800 rounded-lg border overflow-hidden transition-all group relative ${
              selectedAssetId === id 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                : 'border-slate-700 hover:border-slate-500'
            }`}
          >
            <AssetThumbnail assetId={id} />
            <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </button>
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
