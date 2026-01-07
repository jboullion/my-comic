import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for handling PWA install prompt
 * Returns install state and handler
 */
export default function usePWAInstall() {
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

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsPWAInstallable(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return { isPWAInstallable, handleInstall }
}
