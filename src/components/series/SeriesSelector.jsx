import { useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import useSeriesStore from '../../stores/useSeriesStore'

/**
 * SeriesSelector Component
 * Dropdown for selecting a series
 */
export default function SeriesSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  allowNone = true
}) {
  const { series, seriesLoading, loadSeries } = useSeriesStore()

  // Load series if not already loaded
  useEffect(() => {
    if (series.length === 0 && !seriesLoading) {
      loadSeries()
    }
  }, [series.length, seriesLoading, loadSeries])

  const handleChange = (e) => {
    const val = e.target.value
    // Convert to number or null for "none"
    onChange(val === '' ? null : Number(val))
  }

  return (
    <div className={className}>
      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
        Series
      </label>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled || seriesLoading}
          className="w-full appearance-none px-4 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 cursor-pointer"
        >
          {seriesLoading ? (
            <option value="">Loading...</option>
          ) : (
            <>
              {allowNone && <option value="">None (Uncategorized)</option>}
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </>
          )}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FiChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  )
}

/**
 * SeriesDisplay Component
 * Shows the series name with an icon (read-only display)
 */
export function SeriesDisplay({ seriesId, className = '' }) {
  const { series, seriesLoading } = useSeriesStore()

  const seriesItem = seriesId ? series.find(s => s.id === seriesId) : null

  if (seriesLoading) {
    return (
      <span className={`text-slate-500 text-sm ${className}`}>
        Loading...
      </span>
    )
  }

  // Show "Uncategorized" for null seriesId
  const displayName = seriesItem?.name || 'Uncategorized'

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-slate-400 ${className}`}>
      <RiBookShelfFill className="w-3 h-3" />
      {displayName}
    </span>
  )
}
