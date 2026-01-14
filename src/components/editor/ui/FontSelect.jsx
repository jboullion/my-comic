/**
 * FontSelect Component
 * A dropdown select for font families with preview
 *
 * Can use either:
 * - Default FONTS (legacy, for settings tabs)
 * - projectFonts (from useProjectFonts hook, for element properties)
 */

import { useMemo } from 'react'

// Default font list (used when projectFonts not provided)
const FONTS = [
  // Comic style
  { value: 'Bangers, cursive', label: 'Bangers', category: 'comic' },
  { value: 'Comic Neue, cursive', label: 'Comic Neue', category: 'comic' },
  { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS', category: 'comic' },
  { value: 'Permanent Marker, cursive', label: 'Permanent Marker', category: 'comic' },
  { value: 'Caveat, cursive', label: 'Caveat', category: 'comic' },
  // Display
  { value: 'Anton, sans-serif', label: 'Anton', category: 'display' },
  { value: 'Black Ops One, system-ui', label: 'Black Ops One', category: 'display' },
  { value: 'Impact, sans-serif', label: 'Impact', category: 'display' },
  // Clean
  { value: 'Noto Sans, sans-serif', label: 'Noto Sans', category: 'clean' },
  { value: 'Arial, sans-serif', label: 'Arial', category: 'clean' },
  { value: 'Roboto, sans-serif', label: 'Roboto', category: 'clean' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans', category: 'clean' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', category: 'clean' },
]

export { FONTS }

export default function FontSelect({
  label,
  value,
  onChange,
  filter = null,       // 'comic' | 'display' | 'clean' | 'custom' | null (all)
  projectFonts = null, // Optional: fonts from project settings (overrides FONTS)
}) {
  // Use project fonts if provided, otherwise use defaults
  const baseFonts = useMemo(() => {
    if (projectFonts && projectFonts.length > 0) {
      // Convert project fonts to FontSelect format
      return projectFonts.map(f => ({
        value: f.family,
        label: f.name,
        category: f.category
      }))
    }
    return FONTS
  }, [projectFonts])

  // Filter fonts if a filter is specified
  const filteredFonts = useMemo(() => {
    if (!filter) return baseFonts
    return baseFonts.filter(f => f.category === filter)
  }, [baseFonts, filter])

  // Group fonts by category for better organization
  const groupedFonts = useMemo(() => {
    if (!projectFonts || projectFonts.length === 0) {
      // For default fonts, don't group
      return null
    }

    const groups = {}
    filteredFonts.forEach(font => {
      const cat = font.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(font)
    })
    return groups
  }, [filteredFonts, projectFonts])

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] text-slate-500 uppercase font-bold">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
      >
        {groupedFonts ? (
          // Grouped display for project fonts
          Object.entries(groupedFonts).map(([category, fonts]) => (
            <optgroup
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
            >
              {fonts.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              ))}
            </optgroup>
          ))
        ) : (
          // Flat display for default fonts
          filteredFonts.map((font) => (
            <option
              key={font.value}
              value={font.value}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </option>
          ))
        )}
      </select>
    </div>
  )
}
