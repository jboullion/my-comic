import { useEffect, useState } from 'react'
import { FiCheckCircle, FiWifiOff } from 'react-icons/fi'

/**
 * Offline Indicator
 * 
 * Shows a banner when the app loses internet connectivity.
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Brief delay before hiding to show "Back online" message
      setTimeout(() => setShowOffline(false), 2000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOffline && isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`px-4 py-2 text-center text-sm font-medium transition-colors ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-amber-500 text-slate-900'
      }`}>
        {isOnline ? (
          <div className="flex items-center justify-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            Back online
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FiWifiOff className="w-4 h-4" />
            You're offline — Changes will sync when reconnected
          </div>
        )}
      </div>
    </div>
  )
}
