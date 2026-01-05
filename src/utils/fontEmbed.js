/**
 * Font Embedding Utility
 *
 * Fetches Google Fonts CSS and converts font files to base64 data URLs
 * for use with html-to-image's fontEmbedCSS option.
 */

// Cache the embedded CSS to avoid re-fetching
let cachedFontCSS = null
let cachePromise = null

// Google Fonts URL (same as in index.html)
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Black+Ops+One&family=Caveat:wght@400;700&family=Comic+Neue:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Permanent+Marker&family=Roboto:wght@400;700&display=swap'

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
 * Fetch Google Fonts CSS and convert all font URLs to base64
 * Returns CSS string with embedded fonts
 */
async function buildEmbeddedFontCSS() {
  try {
    // Fetch the CSS from Google Fonts
    // Browser automatically sends its User-Agent, so Google returns the optimal format
    const response = await fetch(GOOGLE_FONTS_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Fonts CSS: ${response.status}`)
    }

    let css = await response.text()

    // Extract all font URLs
    const fontUrls = extractFontUrls(css)

    // Convert each font to base64 in parallel
    const base64Results = await Promise.all(
      fontUrls.map(async (url) => ({
        url,
        base64: await fontToBase64(url)
      }))
    )

    // Replace URLs with base64 data URLs
    for (const { url, base64 } of base64Results) {
      if (base64) {
        css = css.replace(new RegExp(escapeRegExp(url), 'g'), base64)
      }
    }

    return css
  } catch (error) {
    console.error('Failed to build embedded font CSS:', error)
    return null
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get embedded font CSS (cached)
 * Call this before using html-to-image to ensure fonts are embedded
 */
export async function getEmbeddedFontCSS() {
  // Return cached result if available
  if (cachedFontCSS) {
    return cachedFontCSS
  }

  // If already fetching, wait for that promise
  if (cachePromise) {
    return cachePromise
  }

  // Start fetching and cache the promise
  cachePromise = buildEmbeddedFontCSS()
  cachedFontCSS = await cachePromise
  cachePromise = null

  return cachedFontCSS
}

/**
 * Preload fonts in the background
 * Call this early (e.g., on app start) to have fonts ready for capture
 */
export function preloadFonts() {
  // Fire and forget - just start the fetch
  getEmbeddedFontCSS().catch(() => {
    // Silently fail - we'll try again when needed
  })
}
