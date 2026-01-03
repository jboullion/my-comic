import { useRegisterSW } from 'virtual:pwa-register/react'
import { FiRefreshCw, FiCheckCircle, FiX } from 'react-icons/fi'

/**
 * PWA Update Prompt
 * 
 * Shows a notification when a service worker update is available.
 * Users can reload to get the latest version.
 */
export default function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {needRefresh ? (
            <FiRefreshCw className="w-6 h-6 text-indigo-400" />
          ) : (
            <FiCheckCircle className="w-6 h-6 text-green-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white mb-1">
            {needRefresh ? 'Update Available' : 'App Ready to Work Offline'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {needRefresh 
              ? 'A new version of Comic Book Maker is available. Reload to update.' 
              : 'The app has been cached and is now available offline.'}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {needRefresh && (
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-medium transition-colors"
              >
                Reload
              </button>
            )}
            <button
              onClick={close}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={close}
          className="flex-shrink-0 text-slate-500 hover:text-white transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
