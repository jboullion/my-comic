/**
 * useProjectFonts Hook
 * Dynamically loads Google Fonts based on project font settings
 */

import { useEffect, useMemo, useRef } from 'react'
import { buildGoogleFontsUrl, getFontsToLoad, getProjectFonts } from '../lib/fonts'

/**
 * Hook to dynamically load fonts for a project
 * Injects a <link> tag for Google Fonts when script or custom fonts change
 *
 * @param {string} fontScript - The font script ('latin', 'cjk', etc.)
 * @param {Array} customFonts - Array of custom font objects
 * @returns {Object} - { fonts: combined font list, isLoading: boolean }
 */
export function useProjectFonts(fontScript = 'latin', customFonts = []) {
  const linkRef = useRef(null)
  const loadingRef = useRef(false)

  // Get the combined font list for the project
  const fonts = useMemo(() => {
    return getProjectFonts(fontScript, customFonts)
  }, [fontScript, customFonts])

  // Get fonts that need to be dynamically loaded
  const fontsToLoad = useMemo(() => {
    return getFontsToLoad(fontScript, customFonts)
  }, [fontScript, customFonts])

  // Load fonts when they change
  useEffect(() => {
    // Remove existing dynamic font link
    if (linkRef.current) {
      linkRef.current.remove()
      linkRef.current = null
    }

    // If no fonts to load, we're done
    if (fontsToLoad.length === 0) {
      return
    }

    // Create and inject new link tag
    const url = buildGoogleFontsUrl(fontsToLoad)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.id = 'project-fonts'

    // Add preconnect for faster loading
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'https://fonts.gstatic.com'
    preconnect.crossOrigin = 'anonymous'

    document.head.appendChild(preconnect)
    document.head.appendChild(link)
    linkRef.current = link

    // Cleanup on unmount or when fonts change
    return () => {
      if (linkRef.current) {
        linkRef.current.remove()
        linkRef.current = null
      }
      preconnect.remove()
    }
  }, [fontsToLoad])

  return {
    fonts,
    fontsToLoad,
    isLoading: loadingRef.current
  }
}

/**
 * Hook to get project fonts from settings
 * Use in components that need to access the current project's font configuration
 *
 * @param {Object} settings - Project settings object
 * @returns {Object} - { fonts, fontScript, customFonts }
 */
export function useProjectFontsFromSettings(settings) {
  const fontScript = settings?.fontScript || 'latin'
  const customFonts = settings?.customFonts || []

  return useProjectFonts(fontScript, customFonts)
}

export default useProjectFonts
