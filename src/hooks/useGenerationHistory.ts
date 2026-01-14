import { useState, useEffect, useCallback } from 'react'
import {
  generationHistoryDb,
  GenerationHistoryEntry
} from '../lib/generationHistory'

interface UseGenerationHistoryOptions {
  projectId: number | null
  pageSize?: number
}

interface UseGenerationHistoryReturn {
  entries: GenerationHistoryEntry[]
  isLoading: boolean
  hasMore: boolean
  totalCount: number
  loadMore: () => Promise<void>
  togglePin: (id: number) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  clearAll: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook for managing AI generation history with pagination
 */
export function useGenerationHistory({
  projectId,
  pageSize = 20
}: UseGenerationHistoryOptions): UseGenerationHistoryReturn {
  const [entries, setEntries] = useState<GenerationHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [offset, setOffset] = useState(0)

  const hasMore = entries.length < totalCount

  // Load initial page
  const loadInitial = useCallback(async () => {
    if (!projectId) {
      setEntries([])
      setTotalCount(0)
      setOffset(0)
      return
    }

    setIsLoading(true)
    try {
      const [page, count] = await Promise.all([
        generationHistoryDb.getPage(projectId, 0, pageSize),
        generationHistoryDb.getCount(projectId)
      ])
      setEntries(page)
      setTotalCount(count)
      setOffset(page.length)
    } catch (error) {
      console.error('Failed to load generation history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, pageSize])

  // Load more entries (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!projectId || isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const page = await generationHistoryDb.getPage(projectId, offset, pageSize)
      setEntries(prev => [...prev, ...page])
      setOffset(prev => prev + page.length)
    } catch (error) {
      console.error('Failed to load more history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, offset, pageSize, isLoading, hasMore])

  // Toggle pin status
  const togglePin = useCallback(async (id: number) => {
    try {
      const newPinned = await generationHistoryDb.togglePin(id)
      setEntries(prev =>
        prev.map(e => (e.id === id ? { ...e, pinned: newPinned } : e))
      )
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }, [])

  // Delete a single entry
  const deleteEntry = useCallback(async (id: number) => {
    try {
      await generationHistoryDb.delete(id)
      setEntries(prev => prev.filter(e => e.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (error) {
      console.error('Failed to delete history entry:', error)
    }
  }, [])

  // Clear all unpinned entries
  const clearAll = useCallback(async () => {
    if (!projectId) return

    try {
      await generationHistoryDb.clearUnpinned(projectId)
      // Reload to get only pinned entries
      await loadInitial()
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }, [projectId, loadInitial])

  // Refresh the list (reload from beginning)
  const refresh = useCallback(async () => {
    await loadInitial()
  }, [loadInitial])

  // Initial load when projectId changes
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  return {
    entries,
    isLoading,
    hasMore,
    totalCount,
    loadMore,
    togglePin,
    deleteEntry,
    clearAll,
    refresh
  }
}
