/**
 * Shared utilities for AI integrations
 */

/**
 * Fetch image from URL and convert to Blob
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Blob>}
 */
export async function fetchImageAsBlob(imageUrl) {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch image')
  }
  return await response.blob()
}
