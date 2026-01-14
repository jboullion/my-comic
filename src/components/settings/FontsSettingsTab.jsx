import { useState } from 'react'
import { FiPlus, FiX, FiInfo, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { validateGoogleFont, createCustomFont, BASE_FONTS } from '../../lib/fonts'

/**
 * FontsSettingsTab Component
 * Custom Google Font management for projects
 */
export default function FontsSettingsTab({
  customFonts,
  onUpdateCustomFonts
}) {
  const [newFontName, setNewFontName] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [validationSuccess, setValidationSuccess] = useState(false)

  const handleAddFont = async () => {
    if (!newFontName.trim()) return

    // Check if font already exists in custom fonts
    const existsInCustom = customFonts.some(
      f => f.name.toLowerCase() === newFontName.trim().toLowerCase()
    )
    if (existsInCustom) {
      setValidationError('This font is already added')
      return
    }

    // Check if font already exists in base fonts
    const existsInBase = BASE_FONTS.some(
      f => f.name.toLowerCase() === newFontName.trim().toLowerCase()
    )
    if (existsInBase) {
      setValidationError('This font is already included in the default fonts')
      return
    }

    // Validate font exists on Google Fonts
    setIsValidating(true)
    setValidationError(null)
    setValidationSuccess(false)

    const result = await validateGoogleFont(newFontName)

    if (result.valid) {
      const newFont = createCustomFont(newFontName)
      onUpdateCustomFonts([...customFonts, newFont])
      setNewFontName('')
      setValidationSuccess(true)
      setTimeout(() => setValidationSuccess(false), 2000)
    } else {
      setValidationError(result.error)
    }

    setIsValidating(false)
  }

  const handleRemoveFont = (fontName) => {
    onUpdateCustomFonts(customFonts.filter(f => f.name !== fontName))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFont()
    }
  }

  return (
    <div className="space-y-8">
      {/* Base Fonts Info */}
      <section>
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Default Fonts
        </h2>

        <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-4">
          <FiInfo className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400">
            These fonts are always available in your projects. Add custom Google Fonts below for more options.
          </p>
        </div>

        {/* Preview of base fonts */}
        <div className="flex flex-wrap gap-1.5">
          {BASE_FONTS.slice(0, 10).map(font => (
            <span
              key={font.name}
              className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded"
              style={{ fontFamily: font.family }}
            >
              {font.name}
            </span>
          ))}
          {BASE_FONTS.length > 10 && (
            <span className="px-2 py-1 text-xs bg-slate-800 text-slate-500 rounded">
              +{BASE_FONTS.length - 10} more
            </span>
          )}
        </div>
      </section>

      {/* Custom Fonts */}
      <section>
        <h2 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">
          Custom Fonts
        </h2>

        <p className="text-xs text-slate-400 mb-4">
          Add additional Google Fonts to this project. Enter the exact font name from{' '}
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            fonts.google.com
          </a>
        </p>

        {/* Add font input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newFontName}
            onChange={(e) => {
              setNewFontName(e.target.value)
              setValidationError(null)
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Hachi Maru Pop"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            disabled={isValidating}
          />
          <button
            onClick={handleAddFont}
            disabled={!newFontName.trim() || isValidating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4" />
                Add Font
              </>
            )}
          </button>
        </div>

        {/* Validation feedback */}
        {validationError && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-red-900/30 border border-red-700/50 rounded-lg">
            <FiAlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-300">{validationError}</p>
          </div>
        )}

        {validationSuccess && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-green-900/30 border border-green-700/50 rounded-lg">
            <FiCheck className="w-4 h-4 text-green-400" />
            <p className="text-sm text-green-300">Font added successfully!</p>
          </div>
        )}

        {/* Custom fonts list */}
        {customFonts.length > 0 ? (
          <div className="space-y-2">
            {customFonts.map(font => (
              <div
                key={font.name}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <span
                  className="text-sm text-white"
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </span>
                <button
                  onClick={() => handleRemoveFont(font.name)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
                  title="Remove font"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center bg-slate-800/30 rounded-lg border border-slate-700/30">
            <p className="text-sm text-slate-500">No custom fonts added yet</p>
          </div>
        )}
      </section>
    </div>
  )
}
