/**
 * useProjectFonts Hook
 * Dynamically loads custom Google Fonts for projects
 */

import { useEffect, useMemo, useRef } from 'react'
import { buildGoogleFontsUrl, getCustomFontsToLoad, getProjectFonts } from '../lib/fonts'

/**
 * Hook to dynamically load custom fonts for a project
 * Injects a <link> tag for Google Fonts when custom fonts change
 *
 * @param {Array} customFonts - Array of custom font objects
 * @returns {Object} - { fonts: combined font list }
 */
export function useProjectFonts(customFonts = []) {
  const linkRef = useRef(null)

  // Get the combined font list for the project (base + custom)
  const fonts = useMemo(() => {
    return getProjectFonts(customFonts)
  }, [customFonts])

  // Get custom fonts that need to be dynamically loaded
  const fontsToLoad = useMemo(() => {
    return getCustomFontsToLoad(customFonts)
  }, [customFonts])

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

    // Handle load errors gracefully
    link.onerror = () => {
      console.warn('Failed to load some project fonts. Some fonts may not display correctly.')
    }

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
    fontsToLoad
  }
}

/**
 * Hook to get project fonts from settings
 * Use in components that need to access the current project's font configuration
 *
 * @param {Object} settings - Project settings object
 * @returns {Object} - { fonts, customFonts }
 */
export function useProjectFontsFromSettings(settings) {
  const customFonts = settings?.customFonts || []

  return useProjectFonts(customFonts)
}

export default useProjectFonts
