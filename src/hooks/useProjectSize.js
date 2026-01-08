import { useState, useEffect } from 'react'
import { calculateProjectSize } from '../lib/storage'

/**
 * Hook to get the storage size of a project
 */
export function useProjectSize(projectId) {
  const [size, setSize] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setSize(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchSize() {
      setLoading(true)
      try {
        const result = await calculateProjectSize(projectId)
        if (!cancelled) {
          setSize(result)
        }
      } catch (error) {
        console.error('Failed to calculate project size:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchSize()

    return () => {
      cancelled = true
    }
  }, [projectId])

  return { size, loading }
}
