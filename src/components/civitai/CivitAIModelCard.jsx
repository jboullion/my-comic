import { FiDownload, FiHeart, FiUser } from 'react-icons/fi'
import { getModelThumbnail, getLatestVersion } from '../../lib/civitai'

/**
 * Card component for displaying a CivitAI model in the browser
 */
export default function CivitAIModelCard({ model, onSelect, isSelected = false }) {
  const thumbnail = getModelThumbnail(model)
  const latestVersion = getLatestVersion(model)

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <button
      onClick={() => onSelect(model)}
      className={`
        group relative bg-slate-800/50 rounded-lg overflow-hidden border transition-all text-left w-full
        ${isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/50'
          : 'border-slate-700 hover:border-slate-600'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-slate-900 relative overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={model.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <FiUser className="w-12 h-12" />
          </div>
        )}

        {/* Base model badge */}
        {latestVersion?.baseModel && (
          <span className="absolute top-2 left-2 text-[10px] font-medium bg-black/70 text-white px-1.5 py-0.5 rounded">
            {latestVersion.baseModel}
          </span>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
            <span className="bg-indigo-500 text-white text-xs font-medium px-2 py-1 rounded">
              Selected
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-white truncate mb-1" title={model.name}>
          {model.name}
        </h3>

        <p className="text-xs text-slate-500 truncate mb-2">
          by {model.creator?.username || 'Unknown'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1" title="Downloads">
            <FiDownload className="w-3 h-3" />
            {formatNumber(model.stats?.downloadCount || 0)}
          </span>
          <span className="flex items-center gap-1" title="Favorites">
            <FiHeart className="w-3 h-3" />
            {formatNumber(model.stats?.favoriteCount || 0)}
          </span>
        </div>
      </div>
    </button>
  )
}
