import { db } from './db'

/**
 * AI Generation History Management
 *
 * Stores AI image generation history with full images for gallery display.
 * Supports pinning (pinned items never auto-deleted) and pagination.
 */

// Type definitions
export interface StructuredPrompts {
  scene: string
  character: string
  lighting: string
  composition: string
}

export interface AdvancedParams {
  guidanceScale: number
  inferenceSteps: number
  negativePrompt: string
  seed: number | null
}

export interface GenerationHistoryEntry {
  id?: number
  projectId: number
  timestamp: number
  pinned: boolean
  prompt: string
  style: string | null
  model: string
  imageSize: string | { width: number; height: number }
  structuredPrompts?: StructuredPrompts | null
  advancedStyle?: string | null
  advancedParams?: AdvancedParams | null
  imageBlob: Blob
  imageWidth: number
  imageHeight: number
}

/**
 * Fetch and convert an image URL to a WebP blob (full size)
 * @param imageUrl - Source image URL (can be CDN URL or data URL)
 * @param quality - WebP quality 0-1 (default 0.85)
 */
export async function fetchImageAsWebP(
  imageUrl: string,
  quality: number = 0.85
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width: img.width, height: img.height })
          } else {
            reject(new Error('Failed to create image blob'))
          }
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}

/**
 * Generation History Database Operations
 */
export const generationHistoryDb = {
  /**
   * Add a new history entry
   */
  async add(entry: Omit<GenerationHistoryEntry, 'id'>): Promise<GenerationHistoryEntry> {
    const id = await db.generationHistory.add(entry)
    return { ...entry, id }
  },

  /**
   * Get paginated history entries (newest first)
   */
  async getPage(
    projectId: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<GenerationHistoryEntry[]> {
    // Get entries sorted by timestamp descending (newest first)
    const entries = await db.generationHistory
      .where('projectId')
      .equals(projectId)
      .reverse()
      .sortBy('timestamp')

    // Apply pagination
    return entries.slice(offset, offset + limit)
  },

  /**
   * Get total count for a project
   */
  async getCount(projectId: number): Promise<number> {
    return await db.generationHistory
      .where('projectId')
      .equals(projectId)
      .count()
  },

  /**
   * Get pinned count for a project
   */
  async getPinnedCount(projectId: number): Promise<number> {
    const entries = await db.generationHistory
      .where('projectId')
      .equals(projectId)
      .toArray()
    return entries.filter(e => e.pinned).length
  },

  /**
   * Toggle pin status
   */
  async togglePin(id: number): Promise<boolean> {
    const entry = await db.generationHistory.get(id)
    if (!entry) {
      throw new Error(`History entry ${id} not found`)
    }
    const newPinned = !entry.pinned
    await db.generationHistory.update(id, { pinned: newPinned })
    return newPinned
  },

  /**
   * Delete a single entry
   */
  async delete(id: number): Promise<void> {
    await db.generationHistory.delete(id)
  },

  /**
   * Delete all unpinned entries for a project
   */
  async clearUnpinned(projectId: number): Promise<number> {
    const entries = await db.generationHistory
      .where('projectId')
      .equals(projectId)
      .toArray()

    const unpinnedIds = entries.filter(e => !e.pinned).map(e => e.id!)
    await db.generationHistory.bulkDelete(unpinnedIds)
    return unpinnedIds.length
  },

  /**
   * Prune to limit - keeps all pinned + newest unpinned up to limit
   * Called after adding new entries to enforce the 100-item cap
   */
  async pruneToLimit(projectId: number, limit: number = 100): Promise<number> {
    const allEntries = await db.generationHistory
      .where('projectId')
      .equals(projectId)
      .toArray()

    // Separate pinned and unpinned
    const pinnedEntries = allEntries.filter(e => e.pinned)
    const unpinnedEntries = allEntries
      .filter(e => !e.pinned)
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp desc (newest first)

    // Calculate how many unpinned we can keep
    const unpinnedLimit = Math.max(0, limit - pinnedEntries.length)

    // Find entries to delete (oldest unpinned beyond the limit)
    const toDelete = unpinnedEntries.slice(unpinnedLimit)

    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map(e => e.id!)
      await db.generationHistory.bulkDelete(idsToDelete)
    }

    return toDelete.length
  }
}
