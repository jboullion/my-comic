import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function PublicNav() {
  const location = useLocation()
  const [isPWAInstallable, setIsPWAInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsPWAInstallable(true)
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsPWAInstallable(false)
    }
    setDeferredPrompt(null)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Comic Book Maker</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/docs" 
            className={`text-sm transition-colors ${isActive('/docs') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Docs
          </Link>
          <Link 
            to="/contact" 
            className={`text-sm transition-colors ${isActive('/contact') ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isPWAInstallable && (
            <button 
              onClick={handleInstall}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-300"
            >
              Install App
            </button>
          )}
          <Link 
            to="/"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors text-white"
          >
            Start Creating
          </Link>
        </div>
      </div>
    </header>
  )
}
