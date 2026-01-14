/**
 * Font System
 * Script-based font presets and utilities for multilingual support
 */

/**
 * Font script definitions with preset fonts for each writing system
 */
export const FONT_SCRIPTS = {
  latin: {
    label: 'Latin (Default)',
    description: 'English, Spanish, French, German, etc.',
    fonts: [
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
  },
  cjk: {
    label: 'CJK (Japanese/Korean/Chinese)',
    description: 'Includes manga-style fonts for East Asian languages',
    fonts: [
      // Japanese
      { name: 'Noto Sans JP', family: 'Noto Sans JP, sans-serif', category: 'clean' },
      { name: 'Zen Maru Gothic', family: 'Zen Maru Gothic, sans-serif', category: 'comic' },
      { name: 'M PLUS Rounded 1c', family: 'M PLUS Rounded 1c, sans-serif', category: 'comic' },
      { name: 'Kosugi Maru', family: 'Kosugi Maru, sans-serif', category: 'comic' },
      { name: 'Hachi Maru Pop', family: 'Hachi Maru Pop, cursive', category: 'comic' },
      // Korean
      { name: 'Noto Sans KR', family: 'Noto Sans KR, sans-serif', category: 'clean' },
      { name: 'Gothic A1', family: 'Gothic A1, sans-serif', category: 'clean' },
      // Chinese (Simplified)
      { name: 'Noto Sans SC', family: 'Noto Sans SC, sans-serif', category: 'clean' },
      { name: 'ZCOOL XiaoWei', family: 'ZCOOL XiaoWei, serif', category: 'display' },
    ]
  },
  cyrillic: {
    label: 'Cyrillic',
    description: 'Russian, Ukrainian, Bulgarian, etc.',
    fonts: [
      { name: 'Noto Sans', family: 'Noto Sans, sans-serif', category: 'clean' },
      { name: 'Roboto', family: 'Roboto, sans-serif', category: 'clean' },
      { name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'clean' },
      { name: 'Comfortaa', family: 'Comfortaa, cursive', category: 'comic' },
      { name: 'Pacifico', family: 'Pacifico, cursive', category: 'display' },
      { name: 'Oswald', family: 'Oswald, sans-serif', category: 'display' },
      { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'clean' },
    ]
  },
  arabic: {
    label: 'Arabic',
    description: 'Arabic, Persian, Urdu (right-to-left)',
    fonts: [
      { name: 'Noto Sans Arabic', family: 'Noto Sans Arabic, sans-serif', category: 'clean' },
      { name: 'Noto Kufi Arabic', family: 'Noto Kufi Arabic, sans-serif', category: 'display' },
      { name: 'Amiri', family: 'Amiri, serif', category: 'clean' },
      { name: 'Cairo', family: 'Cairo, sans-serif', category: 'clean' },
      { name: 'Tajawal', family: 'Tajawal, sans-serif', category: 'clean' },
      { name: 'Lateef', family: 'Lateef, serif', category: 'display' },
    ]
  },
  devanagari: {
    label: 'Devanagari',
    description: 'Hindi, Sanskrit, Marathi, Nepali',
    fonts: [
      { name: 'Noto Sans Devanagari', family: 'Noto Sans Devanagari, sans-serif', category: 'clean' },
      { name: 'Poppins', family: 'Poppins, sans-serif', category: 'clean' },
      { name: 'Hind', family: 'Hind, sans-serif', category: 'clean' },
      { name: 'Mukta', family: 'Mukta, sans-serif', category: 'clean' },
      { name: 'Tiro Devanagari Hindi', family: 'Tiro Devanagari Hindi, serif', category: 'display' },
      { name: 'Rozha One', family: 'Rozha One, serif', category: 'display' },
    ]
  }
}

/**
 * Base Latin fonts that are always loaded (in index.html)
 */
export const BASE_LATIN_FONTS = [
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
 * Get fonts for a specific script, combined with custom fonts
 * @param {string} script - Script key ('latin', 'cjk', etc.)
 * @param {Array} customFonts - User's custom fonts
 * @returns {Array} Combined font list
 */
export function getProjectFonts(script = 'latin', customFonts = []) {
  const scriptData = FONT_SCRIPTS[script] || FONT_SCRIPTS.latin
  const scriptFonts = scriptData.fonts

  // If not Latin, also include Latin fonts as base
  let allFonts = script === 'latin'
    ? [...scriptFonts]
    : [...FONT_SCRIPTS.latin.fonts, ...scriptFonts]

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
 * Get font names that need to be dynamically loaded (not in base Latin)
 * @param {string} script - Script key
 * @param {Array} customFonts - User's custom fonts
 * @returns {string[]} Font names to load
 */
export function getFontsToLoad(script = 'latin', customFonts = []) {
  const fontsToLoad = []

  // If non-Latin script, load those fonts
  if (script !== 'latin') {
    const scriptData = FONT_SCRIPTS[script]
    if (scriptData) {
      scriptData.fonts.forEach(font => {
        // Don't include fonts that are already in base Latin
        if (!BASE_LATIN_FONTS.includes(font.name)) {
          fontsToLoad.push(font.name)
        }
      })
    }
  }

  // Add custom fonts
  customFonts.forEach(font => {
    if (!BASE_LATIN_FONTS.includes(font.name)) {
      fontsToLoad.push(font.name)
    }
  })

  return fontsToLoad
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
