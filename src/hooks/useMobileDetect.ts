import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Detect if the user is on a mobile device
 * Based on screen width AND touch-only device detection
 */
export function useMobileDetect(): { isMobile: boolean } {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return checkIsMobile()
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { isMobile }
}

function checkIsMobile(): boolean {
  const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT

  // Check for touch-only device (no fine pointer like a mouse)
  const hasNoFinePointer = !window.matchMedia('(pointer: fine)').matches
  const hasTouch = 'ontouchstart' in window
  const isTouchOnly = hasNoFinePointer && hasTouch

  // Only consider mobile if BOTH narrow screen AND touch-only device
  // This prevents desktop users with narrow windows from being blocked
  return isNarrowScreen && isTouchOnly
}
