/**
 * Font System
 * Base fonts and custom Google Font support
 */

/**
 * Base fonts available in the app (loaded in index.html)
 * These are always available without additional loading
 */
export const BASE_FONTS = [
  // Comic style
  { name: 'Bangers', family: 'Bangers, cursive', category: 'comic' },
  { name: 'Comic Neue', family: 'Comic Neue, cursive', category: 'comic' },
  { name: 'Comic Sans MS', family: '"Comic Sans MS", cursive', category: 'comic' },
  { name: 'Permanent Marker', family: 'Permanent Marker, cursive', category: 'comic' },
  { name: 'Caveat', family: 'Caveat, cursive', category: 'comic' },
  // Display
  { name: 'Anton', family: 'Anton, sans-serif', category: 'display' },
  { name: 'Black Ops One', family: 'Black Ops One, system-ui', category: 'display' },
  { name: 'Impact', family: 'Impact, sans-serif', category: 'display' },
  // Clean
  { name: 'Noto Sans', family: 'Noto Sans, sans-serif', category: 'clean' },
  { name: 'Arial', family: 'Arial, sans-serif', category: 'clean' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'clean' },
  { name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'clean' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'clean' },
]

/**
 * Base font names that are preloaded (in index.html)
 */
export const BASE_FONT_NAMES = [
  'Anton',
  'Bangers',
  'Black Ops One',
  'Caveat',
  'Comic Neue',
  'Montserrat',
  'Noto Sans',
  'Open Sans',
  'Permanent Marker',
  'Roboto'
]

/**
 * Build a Google Fonts URL for a list of font names
 * @param {string[]} fontNames - Array of Google Font names
 * @returns {string} Google Fonts CSS URL
 */
export function buildGoogleFontsUrl(fontNames) {
  if (!fontNames || fontNames.length === 0) return ''

  const families = fontNames.map(name => {
    // URL encode the font name and add weights
    const encoded = name.replace(/ /g, '+')
    return `family=${encoded}:wght@400;700`
  }).join('&')

  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

/**
 * Get all available fonts (base + custom)
 * @param {Array} customFonts - User's custom fonts
 * @returns {Array} Combined font list
 */
export function getProjectFonts(customFonts = []) {
  // Start with base fonts
  let allFonts = [...BASE_FONTS]

  // Add custom fonts at the end with 'custom' category
  const customFontObjects = customFonts.map(f => ({
    name: f.name,
    family: f.family,
    category: 'custom'
  }))

  allFonts = [...allFonts, ...customFontObjects]

  // Remove duplicates by font name
  const seen = new Set()
  return allFonts.filter(font => {
    if (seen.has(font.name)) return false
    seen.add(font.name)
    return true
  })
}

/**
 * Get custom font names that need to be dynamically loaded
 * @param {Array} customFonts - User's custom fonts
 * @returns {string[]} Font names to load
 */
export function getCustomFontsToLoad(customFonts = []) {
  return customFonts
    .filter(font => !BASE_FONT_NAMES.includes(font.name))
    .map(font => font.name)
}

/**
 * Validate that a font exists on Google Fonts
 * @param {string} fontName - The font name to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateGoogleFont(fontName) {
  if (!fontName || fontName.trim().length === 0) {
    return { valid: false, error: 'Font name is required' }
  }

  const url = buildGoogleFontsUrl([fontName.trim()])

  try {
    const response = await fetch(url, { method: 'HEAD' })

    if (response.ok) {
      return { valid: true }
    } else {
      return { valid: false, error: 'Font not found on Google Fonts' }
    }
  } catch (error) {
    return { valid: false, error: 'Failed to validate font. Check your connection.' }
  }
}

/**
 * Create a custom font object from a font name
 * @param {string} fontName - The Google Font name
 * @returns {Object} Font object with name and family
 */
export function createCustomFont(fontName) {
  return {
    name: fontName.trim(),
    family: `${fontName.trim()}, sans-serif`
  }
}
