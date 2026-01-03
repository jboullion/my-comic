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
            if (blob) resolve(blob)
            else reject(new Error('Canvas toBlob failed'))
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
   */
  async upload(projectId, file) {
    // 1. Optimize
    const optimizedBlob = await optimizeImage(file)
    
    // 2. Hash for deduplication
    const hash = await generateHash(optimizedBlob)
    
    // 3. Check if already exists in this project
    const existing = await db.images
      .where({ projectId, hash })
      .first()
    
    if (existing) {
      return existing
    }

    // 4. Store in IndexedDB
    const imageAsset = {
      projectId,
      hash,
      name: file.name,
      size: optimizedBlob.size,
      type: 'image/webp',
      blob: optimizedBlob,
      createdAt: new Date()
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
