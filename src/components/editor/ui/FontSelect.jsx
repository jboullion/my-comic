/**
 * FontSelect Component
 * A dropdown select for font families with preview
 */

const FONTS = [
  // Comic style
  { value: 'Bangers, cursive', label: 'Bangers', category: 'comic' },
  { value: 'Comic Neue, cursive', label: 'Comic Neue', category: 'comic' },
  { value: 'Permanent Marker, cursive', label: 'Permanent Marker', category: 'comic' },
  { value: 'Caveat, cursive', label: 'Caveat', category: 'comic' },
  // Display
  { value: 'Anton, sans-serif', label: 'Anton', category: 'display' },
  { value: 'Black Ops One, system-ui', label: 'Black Ops One', category: 'display' },
  { value: 'Impact, sans-serif', label: 'Impact', category: 'display' },
  // Clean
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
  filter = null, // 'comic' | 'display' | 'clean' | null (all)
}) {
  const filteredFonts = filter
    ? FONTS.filter(f => f.category === filter)
    : FONTS

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] text-slate-500 uppercase font-bold">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        style={{ fontFamily: value }}
      >
        {filteredFonts.map((font) => (
          <option
            key={font.value}
            value={font.value}
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </option>
        ))}
      </select>
    </div>
  )
}
