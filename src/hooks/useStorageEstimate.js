import { useState, useEffect, useCallback } from 'react'
import { getStorageEstimate } from '../lib/storage'

/**
 * Hook to get browser storage estimate
 * Returns { usage, quota, percentage, loading, error, refresh }
 */
export function useStorageEstimate() {
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStorageEstimate()
      setEstimate(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    usage: estimate?.usage || 0,
    quota: estimate?.quota || 0,
    percentage: estimate?.percentage || 0,
    loading,
    error,
    supported: estimate !== null,
    refresh
  }
}
