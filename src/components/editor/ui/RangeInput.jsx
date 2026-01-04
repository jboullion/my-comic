import { FiChevronUp, FiChevronDown } from 'react-icons/fi'

/**
 * RangeInput Component
 * A range slider with an attached number input and custom increment/decrement buttons
 */
export default function RangeInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  inputWidth = 'w-12'
}) {
  const handleSliderChange = (e) => {
    onChange(parseFloat(e.target.value))
  }

  const handleInputChange = (e) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) {
      const clampedVal = Math.min(max, Math.max(min, val))
      onChange(clampedVal)
    }
  }

  const increment = () => {
    const newVal = Math.min(max, value + step)
    onChange(step < 1 ? parseFloat(newVal.toFixed(2)) : newVal)
  }

  const decrement = () => {
    const newVal = Math.max(min, value - step)
    onChange(step < 1 ? parseFloat(newVal.toFixed(2)) : newVal)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] text-slate-500 uppercase font-bold">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="flex-1 accent-indigo-500"
        />
        <div className="flex items-center">
          <input
            type="text"
            value={step < 1 ? value.toFixed(2) : Math.round(value)}
            onChange={handleInputChange}
            className={`${inputWidth} bg-slate-900 border border-slate-700 rounded-l px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
          />
          <div className="flex flex-col border border-l-0 border-slate-700 rounded-r overflow-hidden">
            <button
              type="button"
              onClick={increment}
              className="px-1 py-0 bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <FiChevronUp className="w-3 h-3 text-slate-300" />
            </button>
            <button
              type="button"
              onClick={decrement}
              className="px-1 py-0 bg-slate-700 hover:bg-slate-600 transition-colors border-t border-slate-800"
            >
              <FiChevronDown className="w-3 h-3 text-slate-300" />
            </button>
          </div>
          {suffix && (
            <span className="text-xs text-slate-400 ml-1">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  )
}
