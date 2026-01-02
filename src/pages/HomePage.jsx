import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-xl font-bold">Comic Book Maker</span>
          </div>
          
          {isPWAInstallable && (
            <button 
              onClick={handleInstall}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              Install App
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Amazing Comics
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            A powerful, free comic book editor that works entirely in your browser. 
            No account required. Your data stays on your device.
          </p>
          <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-indigo-500/25">
            Start Creating
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Drag & Drop Editor"
            description="Intuitive panel layout with drag-and-drop support. Add images, resize, and arrange with ease."
          />
          <FeatureCard 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            title="Speech Bubbles & Text"
            description="Professional speech bubbles, thought clouds, captions, and sound effects with custom styling."
          />
          <FeatureCard 
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title="Works Offline"
            description="Install as an app and work offline. Your projects are saved locally and always accessible."
          />
        </div>

        {/* Status Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            PWA Ready • React + Vite • Tailwind CSS
          </div>
        </div>

        {/* Dev Test Pages */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-2">🧪 Development Test Pages</h3>
          <div className="flex gap-2">
            <Link 
              to="/test/file-api" 
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              File System API
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          Comic Book Maker v1.0 • Built with ❤️
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
      <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}
