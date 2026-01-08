import { FiHardDrive } from 'react-icons/fi'
import { useStorageEstimate } from '../../hooks/useStorageEstimate'
import { formatBytes } from '../../lib/storage'

/**
 * StorageBar Component
 * Displays browser storage usage with progress bar
 */
export default function StorageBar() {
  const { usage, quota, percentage, loading, supported } = useStorageEstimate()

  if (!supported) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-lg px-4 py-3 mb-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-48 mb-2" />
        <div className="h-2 bg-slate-700 rounded w-full" />
      </div>
    )
  }

  // Determine bar color based on usage percentage
  let barColor = 'bg-indigo-500'
  let textColor = 'text-slate-400'
  if (percentage >= 95) {
    barColor = 'bg-red-500'
    textColor = 'text-red-400'
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500'
    textColor = 'text-amber-400'
  }

  return (
    <div className="bg-slate-800/50 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FiHardDrive className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-300">
            Storage: {formatBytes(usage)} of {formatBytes(quota)} used
          </span>
        </div>
        <span className={`text-xs ${textColor}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {percentage >= 80 && (
        <p className={`text-xs ${textColor} mt-2`}>
          {percentage >= 95
            ? 'Storage almost full. Consider deleting unused projects.'
            : 'Storage is getting full. Consider cleaning up old projects.'}
        </p>
      )}
    </div>
  )
}
