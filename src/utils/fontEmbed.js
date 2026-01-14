/**
 * Font Embedding Utility
 *
 * Fetches Google Fonts CSS and converts font files to base64 data URLs
 * for use with html-to-image's fontEmbedCSS option.
 *
 * Supports both base fonts (always loaded) and dynamic project fonts.
 */

import { buildGoogleFontsUrl, BASE_LATIN_FONTS, getFontsToLoad } from '../lib/fonts'

// Cache for embedded CSS by font set key
const fontCache = new Map()
const cachePromises = new Map()

// Base Google Fonts URL (Latin fonts always loaded in index.html)
const BASE_GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Black+Ops+One&family=Caveat:wght@400;700&family=Comic+Neue:wght@400;700&family=Montserrat:wght@400;700&family=Noto+Sans:wght@400;700&family=Open+Sans:wght@400;700&family=Permanent+Marker&family=Roboto:wght@400;700&display=swap'

/**
 * Fetch a font file and convert to base64 data URL
 */
async function fontToBase64(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch font: ${url}`)

    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn(`Failed to convert font to base64: ${url}`, error)
    return null
  }
}

/**
 * Parse CSS and extract all font URLs
 */
function extractFontUrls(css) {
  const urlRegex = /url\(["']?(https:\/\/fonts\.gstatic\.com[^"')]+)["']?\)/g
  const urls = []
  let match

  while ((match = urlRegex.exec(css)) !== null) {
    urls.push(match[1])
  }

  return [...new Set(urls)] // Remove duplicates
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Fetch CSS from a URL and embed fonts as base64
 */
async function fetchAndEmbedFonts(url) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Fonts CSS: ${response.status}`)
    }

    let css = await response.text()

    // Extract all font URLs
    const fontUrls = extractFontUrls(css)

    // Convert each font to base64 in parallel
    const base64Results = await Promise.all(
      fontUrls.map(async (fontUrl) => ({
        url: fontUrl,
        base64: await fontToBase64(fontUrl)
      }))
    )

    // Replace URLs with base64 data URLs
    for (const { url: fontUrl, base64 } of base64Results) {
      if (base64) {
        css = css.replace(new RegExp(escapeRegExp(fontUrl), 'g'), base64)
      }
    }

    return css
  } catch (error) {
    console.error('Failed to fetch and embed fonts:', error)
    return null
  }
}

/**
 * Build embedded font CSS for base fonts only
 * Returns CSS string with embedded fonts
 */
async function buildBaseFontCSS() {
  return fetchAndEmbedFonts(BASE_GOOGLE_FONTS_URL)
}

/**
 * Build embedded font CSS for additional fonts (script + custom)
 * @param {string[]} additionalFonts - Font names to embed
 */
async function buildAdditionalFontCSS(additionalFonts) {
  if (!additionalFonts || additionalFonts.length === 0) {
    return null
  }

  const url = buildGoogleFontsUrl(additionalFonts)
  return fetchAndEmbedFonts(url)
}

/**
 * Get embedded font CSS (cached)
 * Call this before using html-to-image to ensure fonts are embedded
 *
 * @param {string} fontScript - Font script key ('latin', 'cjk', etc.)
 * @param {Array} customFonts - Custom fonts array
 * @returns {Promise<string|null>} Embedded CSS or null on error
 */
export async function getEmbeddedFontCSS(fontScript = 'latin', customFonts = []) {
  // Get fonts that need to be loaded dynamically
  const additionalFonts = getFontsToLoad(fontScript, customFonts)

  // Create a cache key based on fonts
  const cacheKey = `base_${additionalFonts.sort().join('_')}`

  // Return cached result if available
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)
  }

  // If already fetching this set, wait for that promise
  if (cachePromises.has(cacheKey)) {
    return cachePromises.get(cacheKey)
  }

  // Build the embedded CSS
  const buildPromise = (async () => {
    // Always get base fonts
    const baseCSS = await buildBaseFontCSS()

    // Get additional fonts if any
    const additionalCSS = await buildAdditionalFontCSS(additionalFonts)

    // Combine CSS
    let combinedCSS = baseCSS || ''
    if (additionalCSS) {
      combinedCSS += '\n' + additionalCSS
    }

    return combinedCSS || null
  })()

  cachePromises.set(cacheKey, buildPromise)

  try {
    const result = await buildPromise
    fontCache.set(cacheKey, result)
    return result
  } finally {
    cachePromises.delete(cacheKey)
  }
}

/**
 * Preload base fonts in the background
 * Call this early (e.g., on app start) to have fonts ready for capture
 */
export function preloadFonts() {
  // Fire and forget - just start the fetch for base fonts
  getEmbeddedFontCSS('latin', []).catch(() => {
    // Silently fail - we'll try again when needed
  })
}

/**
 * Clear the font cache
 * Call this if you need to force re-fetching fonts
 */
export function clearFontCache() {
  fontCache.clear()
}
