import { db } from './db'

/**
 * Storage Utilities
 * Functions for calculating and displaying storage usage
 */

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

/**
 * Get browser storage estimate (IndexedDB quota and usage)
 * Returns null if Storage API is not supported
 */
export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
    }
  } catch (error) {
    console.error('Failed to get storage estimate:', error)
    return null
  }
}

/**
 * Calculate storage size for a single project
 * Returns total bytes used by the project
 */
export async function calculateProjectSize(projectId) {
  try {
    // Get all images for this project
    const images = await db.images.where('projectId').equals(projectId).toArray()
    const imagesSize = images.reduce((sum, img) => sum + (img.size || 0), 0)

    // Get project to calculate thumbnail sizes
    const project = await db.projects.get(projectId)
    let thumbnailsSize = 0

    if (project?.pages) {
      for (const page of project.pages) {
        if (page.thumbnail) {
          // Data URLs are base64 encoded, actual bytes = string length * 0.75
          // But we count the full string since that's what's stored
          thumbnailsSize += page.thumbnail.length
        }
      }
    }

    return imagesSize + thumbnailsSize
  } catch (error) {
    console.error('Failed to calculate project size:', error)
    return 0
  }
}

/**
 * Calculate storage sizes for all projects
 * Returns array of { projectId, size } objects
 */
export async function calculateAllProjectSizes() {
  try {
    const projects = await db.projects.toArray()
    const sizes = []

    for (const project of projects) {
      const size = await calculateProjectSize(project.id)
      sizes.push({ projectId: project.id, size })
    }

    return sizes
  } catch (error) {
    console.error('Failed to calculate all project sizes:', error)
    return []
  }
}
