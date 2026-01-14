import { useState, useEffect } from 'react'
import type { GenerationHistoryEntry } from '../lib/generationHistory'

// Global memory cache for thumbnail blob URLs
const thumbnailUrlCache = new Map<number, string>()

/**
 * Hook to get a blob URL for a generation history thumbnail
 * Creates and caches blob URLs for efficient rendering
 */
export function useHistoryThumbnailUrl(
  entry: GenerationHistoryEntry | null
): string | null {
  const entryId = entry?.id
  const [url, setUrl] = useState<string | null>(() =>
    entryId ? thumbnailUrlCache.get(entryId) ?? null : null
  )
  const [prevEntryId, setPrevEntryId] = useState(entryId)

  // Adjust state if entryId changes during render
  if (entryId !== prevEntryId) {
    setPrevEntryId(entryId)
    setUrl(entryId ? thumbnailUrlCache.get(entryId) ?? null : null)
  }

  useEffect(() => {
    if (!entryId || !entry?.imageBlob) return

    // If already cached, use it
    const cached = thumbnailUrlCache.get(entryId)
    if (cached) {
      if (url !== cached) {
        setUrl(cached)
      }
      return
    }

    // Create new blob URL
    const blobUrl = URL.createObjectURL(entry.imageBlob)
    thumbnailUrlCache.set(entryId, blobUrl)
    setUrl(blobUrl)

    // Note: We don't revoke URLs since they're cached globally
    // and the history entries may be displayed multiple times
  }, [entryId, entry?.imageBlob, url])

  return url
}

/**
 * Clear cached thumbnail URL (call when entry is deleted)
 */
export function clearThumbnailUrlCache(entryId: number): void {
  const cached = thumbnailUrlCache.get(entryId)
  if (cached) {
    URL.revokeObjectURL(cached)
    thumbnailUrlCache.delete(entryId)
  }
}

/**
 * Clear all cached thumbnail URLs
 */
export function clearAllThumbnailUrlCache(): void {
  thumbnailUrlCache.forEach(url => URL.revokeObjectURL(url))
  thumbnailUrlCache.clear()
}
