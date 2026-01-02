import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

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
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
