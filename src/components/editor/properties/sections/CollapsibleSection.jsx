import { useState } from 'react'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

/**
 * CollapsibleSection Component
 * Reusable accordion wrapper for property groups
 */
export default function CollapsibleSection({
  title,
  defaultExpanded = false,
  children,
  storageKey = null
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (storageKey) {
      const stored = localStorage.getItem(`section-${storageKey}`)
      return stored !== null ? stored === 'true' : defaultExpanded
    }
    return defaultExpanded
  })

  const toggle = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    if (storageKey) {
      localStorage.setItem(`section-${storageKey}`, String(newState))
    }
  }

  return (
    <div className="border-t border-slate-800 pt-4">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between group"
        type="button"
      >
        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider group-hover:text-slate-400 transition-colors">
          {title}
        </h4>
        {isExpanded ? (
          <FiChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
        ) : (
          <FiChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
