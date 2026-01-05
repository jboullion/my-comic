import { useRef, useCallback } from 'react'

/**
 * ColorPicker Component
 * Throttled color input to prevent excessive state updates
 */
export default function ColorPicker({
  value,
  onChange,
  className = ''
}) {
  const lastEmitRef = useRef(0)
  const pendingValueRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleChange = useCallback((e) => {
    const newValue = e.target.value
    const now = Date.now()
    const timeSinceLastEmit = now - lastEmitRef.current

    if (timeSinceLastEmit >= 100) {
      // Enough time has passed, emit immediately
      lastEmitRef.current = now
      onChange(newValue)
    } else {
      // Store pending value and schedule emit
      pendingValueRef.current = newValue
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (pendingValueRef.current !== null) {
            lastEmitRef.current = Date.now()
            onChange(pendingValueRef.current)
            pendingValueRef.current = null
          }
          timeoutRef.current = null
        }, 100 - timeSinceLastEmit)
      }
    }
  }, [onChange])

  return (
    <input
      type="color"
      value={value}
      onChange={handleChange}
      className={`bg-slate-900 border border-slate-700 rounded cursor-pointer ${className}`}
    />
  )
}
