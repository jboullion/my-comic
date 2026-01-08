import { db } from './db'

/**
 * Image Optimization Utilities
 */

/**
 * Convert a File to a WebP Blob
 * @param {File} file 
 * @param {number} quality 0-1
 * @param {number} maxWidth 
 * @returns {Promise<Blob>}
 */
export async function optimizeImage(file, quality = 0.85, maxWidth = 1920) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Resize if too large
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Return blob with dimensions
              resolve({ blob, width, height })
            } else {
              reject(new Error('Canvas toBlob failed'))
            }
          },
          'image/webp',
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Generate a simple hash for deduplication
 * @param {Blob} blob 
 * @returns {Promise<string>}
 */
export async function generateHash(blob) {
  const arrayBuffer = await blob.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Image Asset Management
 */
export const imageAssets = {
  /**
   * Upload and store an image
   * @param {number} projectId - Project ID
   * @param {File} file - Image file to upload
   * @param {Object} metadata - Optional AI metadata
   * @param {string} metadata.prompt - AI prompt used
   * @param {string} metadata.model - AI model used (e.g., 'draft', 'production')
   * @param {string} metadata.style - AI style preset used
   * @param {number} metadata.seed - AI generation seed
   */
  async upload(projectId, file, metadata = {}) {
    // 1. Optimize (returns { blob, width, height })
    const { blob: optimizedBlob, width, height } = await optimizeImage(file)

    // 2. Hash for deduplication
    const hash = await generateHash(optimizedBlob)

    // 3. Check if already exists in this project (skip for AI images as each is unique)
    if (!metadata.prompt) {
      const existing = await db.images
        .where({ projectId, hash })
        .first()

      if (existing) {
        return existing
      }
    }

    // 4. Store in IndexedDB with dimensions and optional AI metadata
    const imageAsset = {
      projectId,
      hash,
      name: file.name,
      size: optimizedBlob.size,
      type: 'image/webp',
      blob: optimizedBlob,
      width,
      height,
      createdAt: new Date(),
      // AI metadata (optional - null if not AI-generated)
      aiPrompt: metadata.prompt || null,
      aiModel: metadata.model || null,
      aiStyle: metadata.style || null,
      aiSeed: metadata.seed || null
    }

    const id = await db.images.add(imageAsset)
    return { ...imageAsset, id }
  },

  /**
   * Get image by ID
   */
  async get(id) {
    return await db.images.get(id)
  },

  /**
   * Get all images for a project
   */
  async getByProject(projectId) {
    return await db.images.where({ projectId }).toArray()
  },

  /**
   * Delete an image
   */
  async delete(id) {
    return await db.images.delete(id)
  },

  /**
   * Rename an image asset
   */
  async rename(id, newName) {
    await db.images.update(id, { name: newName })
    return await db.images.get(id)
  }
}
