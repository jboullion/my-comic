import { useState, useEffect } from 'react'
import { FiX, FiMonitor } from 'react-icons/fi'

const STORAGE_KEY = 'mobile-toast-dismissed'

export default function MobileToast() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      // Small delay for smoother appearance
      const timer = setTimeout(() => setIsVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 flex items-start gap-3">
        <FiMonitor className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium">
            Designed for Desktop
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Comic Maker was designed for desktop use. Mobile functionality may come in the future!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
