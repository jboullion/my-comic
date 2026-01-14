/**
 * Font Embedding Utility
 *
 * Fetches Google Fonts CSS and converts font files to base64 data URLs
 * for use with html-to-image's fontEmbedCSS option.
 *
 * Supports both base fonts (always loaded) and custom project fonts.
 */

import { buildGoogleFontsUrl, getCustomFontsToLoad } from '../lib/fonts'

// Cache for embedded CSS by font set key
const fontCache = new Map()
const cachePromises = new Map()

// Base Google Fonts URL (fonts always loaded in index.html)
const BASE_GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Black+Ops+One&family=Caveat:wght@400;700&family=Comic+Neue:wght@400;700&family=Montserrat:wght@400;700&family=Noto+Sans:wght@400;700&family=Open+Sans:wght@400;700&family=Permanent+Marker&family=Roboto:wght@400;700&display=swap'

/**
 * Fetch a font file and convert to base64 data URL
 * Includes timeout to prevent hanging on large fonts
 */
async function fontToBase64(url, timeoutMs = 30000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`Failed to fetch font: ${url}`)

    const blob = await response.blob()

    // Skip very large fonts (over 5MB) to prevent memory issues
    if (blob.size > 5 * 1024 * 1024) {
      console.warn(`Skipping large font (${(blob.size / 1024 / 1024).toFixed(1)}MB): ${url}`)
      return null
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.warn(`Font fetch timed out: ${url}`)
    } else {
      console.warn(`Failed to convert font to base64: ${url}`, error.message)
    }
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
 * Process items with limited concurrency
 * @param {Array} items - Items to process
 * @param {Function} processor - Async function to process each item
 * @param {number} concurrency - Max concurrent operations
 */
async function processWithConcurrency(items, processor, concurrency = 3) {
  const results = []
  const executing = new Set()

  for (const item of items) {
    const promise = processor(item).then(result => {
      executing.delete(promise)
      return result
    })
    executing.add(promise)
    results.push(promise)

    if (executing.size >= concurrency) {
      await Promise.race(executing)
    }
  }

  return Promise.all(results)
}

/**
 * Fetch CSS from a URL and embed fonts as base64
 * Uses limited concurrency to prevent resource exhaustion with large fonts
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

    // Convert fonts with limited concurrency (2 at a time for large fonts)
    const base64Results = await processWithConcurrency(
      fontUrls,
      async (fontUrl) => ({
        url: fontUrl,
        base64: await fontToBase64(fontUrl)
      }),
      2 // Max 2 concurrent font fetches to prevent resource exhaustion
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
 * Build embedded font CSS for custom fonts
 * @param {string[]} customFontNames - Font names to embed
 */
async function buildCustomFontCSS(customFontNames) {
  if (!customFontNames || customFontNames.length === 0) {
    return null
  }

  const url = buildGoogleFontsUrl(customFontNames)
  return fetchAndEmbedFonts(url)
}

/**
 * Get embedded font CSS (cached)
 * Call this before using html-to-image to ensure fonts are embedded
 *
 * @param {Array} customFonts - Custom fonts array
 * @returns {Promise<string|null>} Embedded CSS or null on error
 */
export async function getEmbeddedFontCSS(customFonts = []) {
  // Get custom fonts that need to be loaded
  const customFontNames = getCustomFontsToLoad(customFonts)

  // Create a cache key based on fonts
  const cacheKey = `base_${customFontNames.sort().join('_')}`

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

    // Get custom fonts if any
    const customCSS = await buildCustomFontCSS(customFontNames)

    // Combine CSS
    let combinedCSS = baseCSS || ''
    if (customCSS) {
      combinedCSS += '\n' + customCSS
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
  getEmbeddedFontCSS([]).catch(() => {
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
