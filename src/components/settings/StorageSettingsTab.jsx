import { FiHardDrive } from 'react-icons/fi'
import { useStorageEstimate } from '../../hooks/useStorageEstimate'
import { useProjectSize } from '../../hooks/useProjectSize'
import { formatBytes } from '../../lib/storage'

/**
 * StorageSettingsTab Component
 * Displays storage usage information for the current project and browser
 */
export default function StorageSettingsTab({ projectId }) {
  const { size: projectSize, loading: projectLoading } = useProjectSize(projectId)
  const { usage, quota, percentage, loading: storageLoading, supported } = useStorageEstimate()

  // Determine bar color based on usage percentage
  let barColor = 'bg-indigo-500'
  if (percentage >= 95) {
    barColor = 'bg-red-500'
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500'
  }

  return (
    <div className="space-y-8">
      {/* Project Storage Section */}
      <section>
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Project Storage
        </h2>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <FiHardDrive className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total Size</div>
              {projectLoading ? (
                <div className="h-6 w-20 bg-slate-700 rounded animate-pulse" />
              ) : (
                <div className="text-xl font-semibold text-white">
                  {formatBytes(projectSize || 0)}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Includes all images and page thumbnails in this project.
          </p>
        </div>
      </section>

      {/* Browser Storage Section */}
      <section>
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Browser Storage
        </h2>
        {!supported ? (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              Storage estimate not available in this browser.
            </p>
          </div>
        ) : storageLoading ? (
          <div className="bg-slate-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-48 mb-3" />
            <div className="h-3 bg-slate-700 rounded w-full" />
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">
                {formatBytes(usage)} of {formatBytes(quota)} used
              </span>
              <span className={`text-xs ${percentage >= 80 ? 'text-amber-400' : 'text-slate-500'}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {percentage >= 80 && (
              <p className="text-xs text-amber-400 mt-2">
                {percentage >= 95
                  ? 'Storage is almost full. Delete unused projects to free space.'
                  : 'Storage is getting full. Consider removing old projects.'}
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-3">
          Your projects are stored locally in your browser using IndexedDB. This storage is private to your device and persists across sessions, but may be cleared if you clear browser data.
        </p>
      </section>

      {/* Storage Tips */}
      <section>
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Storage Tips
        </h2>
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">Images</strong> are the largest contributors to storage.
            They are automatically optimized to WebP format when imported.
          </div>
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">Page thumbnails</strong> are generated for quick previews
            and stored with each page.
          </div>
          <div className="text-sm text-slate-400">
            <strong className="text-slate-300">Export to file</strong> to back up your project and free
            browser storage if needed.
          </div>
        </div>
      </section>
    </div>
  )
}
