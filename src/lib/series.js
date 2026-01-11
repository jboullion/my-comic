import { db } from './db'

/**
 * Process image file to WebP and get dimensions
 */
async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      try {
        // Create canvas for WebP conversion
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        // Convert to WebP blob
        const blob = await new Promise((res) =>
          canvas.toBlob(res, 'image/webp', 0.85)
        )

        URL.revokeObjectURL(img.src)
        resolve({
          blob,
          width: img.width,
          height: img.height
        })
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Series Database Operations
 */
export const seriesDb = {
  /**
   * Create a new series
   * @param {string} name - Series name
   * @param {string} description - Series description
   * @returns {Promise<Object>} Created series
   */
  async create(name, description = '') {
    const now = new Date()
    const series = {
      name: name || 'Untitled Series',
      description,
      createdAt: now,
      updatedAt: now
    }

    const id = await db.series.add(series)
    return { ...series, id }
  },

  /**
   * Get all series
   * @returns {Promise<Array>} All series sorted by name
   */
  async getAll() {
    return await db.series.orderBy('name').toArray()
  },

  /**
   * Get a series by ID
   * @param {number} id - Series ID
   * @returns {Promise<Object|undefined>}
   */
  async getById(id) {
    return await db.series.get(id)
  },

  /**
   * Find a series by name (case-insensitive)
   * @param {string} name - Series name
   * @returns {Promise<Object|undefined>}
   */
  async findByName(name) {
    const allSeries = await db.series.toArray()
    return allSeries.find(s => s.name.toLowerCase() === name.toLowerCase())
  },

  /**
   * Find a series by name, or create it if it doesn't exist
   * @param {string} name - Series name
   * @param {string} description - Optional description for new series
   * @returns {Promise<Object>} The found or created series
   */
  async findOrCreate(name, description = '') {
    const existing = await this.findByName(name)
    if (existing) return existing
    return await this.create(name, description)
  },

  /**
   * Update a series
   * @param {number} id - Series ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated series
   */
  async update(id, updates) {
    await db.series.update(id, {
      ...updates,
      updatedAt: new Date()
    })
    return await db.series.get(id)
  },

  /**
   * Delete a series and move its items to Uncategorized
   * @param {number} id - Series ID
   * @throws {Error} If trying to delete the Uncategorized series
   */
  async delete(id) {
    const series = await db.series.get(id)
    if (!series) return

    // Prevent deleting the Uncategorized series
    if (series.name === 'Uncategorized') {
      throw new Error('Cannot delete the Uncategorized series')
    }

    // Find the Uncategorized series to move items to
    const uncategorized = await db.series.where('name').equals('Uncategorized').first()
    if (!uncategorized) {
      throw new Error('Uncategorized series not found')
    }

    // Move all projects to Uncategorized
    await db.projects.where('seriesId').equals(id).modify({ seriesId: uncategorized.id })

    // Move all characters to Uncategorized
    await db.characters.where('seriesId').equals(id).modify({ seriesId: uncategorized.id })

    // Delete the series
    await db.series.delete(id)
  },

  /**
   * Get the Uncategorized series (creates if not exists)
   * @returns {Promise<Object>} The Uncategorized series
   */
  async getUncategorized() {
    let uncategorized = await db.series.where('name').equals('Uncategorized').first()

    // Create if it doesn't exist (shouldn't happen after migration, but just in case)
    if (!uncategorized) {
      const now = new Date()
      const id = await db.series.add({
        name: 'Uncategorized',
        description: 'Default series for projects and characters',
        createdAt: now,
        updatedAt: now
      })
      uncategorized = await db.series.get(id)
    }

    return uncategorized
  },

  /**
   * Get series with counts of projects and characters
   * @returns {Promise<Array>} Series with projectCount and characterCount
   */
  async getAllWithCounts() {
    const seriesList = await db.series.orderBy('name').toArray()

    for (const series of seriesList) {
      series.projectCount = await db.projects.where('seriesId').equals(series.id).count()
      series.characterCount = await db.characters.where('seriesId').equals(series.id).count()
    }

    return seriesList
  },

  /**
   * Get a single series with counts
   * @param {number} id - Series ID
   * @returns {Promise<Object|undefined>} Series with projectCount and characterCount
   */
  async getByIdWithCounts(id) {
    const series = await db.series.get(id)
    if (!series) return undefined

    series.projectCount = await db.projects.where('seriesId').equals(series.id).count()
    series.characterCount = await db.characters.where('seriesId').equals(series.id).count()

    return series
  },

  // ==================
  // Cover Image Operations
  // ==================

  /**
   * Add or update a cover image for a series
   * @param {number} seriesId - Series ID
   * @param {File} file - Image file
   * @returns {Promise<Object>} Created image record
   */
  async setCoverImage(seriesId, file) {
    const series = await db.series.get(seriesId)
    if (!series) throw new Error('Series not found')

    // Process the image
    const { blob, width, height } = await processImageFile(file)

    // Delete existing cover image if any
    await db.seriesImages.where('seriesId').equals(seriesId).delete()

    // Add new cover image
    const imageId = await db.seriesImages.add({
      seriesId,
      blob,
      width,
      height,
      name: file.name,
      createdAt: new Date()
    })

    // Update series with cover image reference
    await db.series.update(seriesId, {
      coverImageId: imageId,
      updatedAt: new Date()
    })

    return await db.seriesImages.get(imageId)
  },

  /**
   * Get cover image for a series
   * @param {number} seriesId - Series ID
   * @returns {Promise<Object|undefined>} Cover image record with blob
   */
  async getCoverImage(seriesId) {
    return await db.seriesImages.where('seriesId').equals(seriesId).first()
  },

  /**
   * Remove cover image from a series
   * @param {number} seriesId - Series ID
   */
  async removeCoverImage(seriesId) {
    await db.seriesImages.where('seriesId').equals(seriesId).delete()
    await db.series.update(seriesId, {
      coverImageId: null,
      updatedAt: new Date()
    })
  },

  /**
   * Get all series with counts AND cover images
   * @returns {Promise<Array>} Series with projectCount, characterCount, and coverImage
   */
  async getAllWithCountsAndImages() {
    const seriesList = await db.series.orderBy('name').toArray()

    for (const series of seriesList) {
      series.projectCount = await db.projects.where('seriesId').equals(series.id).count()
      series.characterCount = await db.characters.where('seriesId').equals(series.id).count()
      series.coverImage = await db.seriesImages.where('seriesId').equals(series.id).first()

      // Migration: Add default provider to customModel if missing
      if (series.customModel && !series.customModel.provider) {
        series.customModel = {
          ...series.customModel,
          provider: 'falai' // Default to Fal.ai for backward compatibility
        }
        // Update in database
        await db.series.update(series.id, { customModel: series.customModel })
      }
    }

    return seriesList
  },

  /**
   * Get a single series with counts and cover image
   * @param {number} id - Series ID
   * @returns {Promise<Object|undefined>} Series with projectCount, characterCount, and coverImage
   */
  async getByIdWithCountsAndImage(id) {
    const series = await db.series.get(id)
    if (!series) return undefined

    series.projectCount = await db.projects.where('seriesId').equals(series.id).count()
    series.characterCount = await db.characters.where('seriesId').equals(series.id).count()
    series.coverImage = await db.seriesImages.where('seriesId').equals(series.id).first()

    // Migration: Add default provider to customModel if missing
    if (series.customModel && !series.customModel.provider) {
      series.customModel = {
        ...series.customModel,
        provider: 'falai' // Default to Fal.ai for backward compatibility
      }
      // Update in database
      await db.series.update(id, { customModel: series.customModel })
    }

    return series
  },

  // ==================
  // Custom Model Operations
  // ==================

  /**
   * Update the custom AI model settings for a series
   * @param {number} seriesId - Series ID
   * @param {Object} customModel - Custom model settings
   * @param {boolean} customModel.enabled - Whether custom model is enabled
   * @param {string} customModel.provider - AI provider ('falai', 'replicate')
   * @param {string} customModel.name - Display name
   * @param {string} customModel.type - Model architecture ('flux', 'sdxl', 'sd15')
   * @param {string} customModel.url - CivitAI download URL
   * @param {boolean} customModel.allowMature - Whether to allow mature content
   * @param {string} customModel.replicateModel - Replicate model ID (e.g., 'username/model:version')
   * @returns {Promise<Object>} Updated series
   */
  async updateCustomModel(seriesId, customModel) {
    // Ensure provider field exists (default to 'falai' if not set)
    const modelWithProvider = {
      ...customModel,
      provider: customModel.provider || 'falai'
    }

    await db.series.update(seriesId, {
      customModel: modelWithProvider,
      updatedAt: new Date()
    })
    return await db.series.get(seriesId)
  },

  /**
   * Get custom model settings for a series
   * @param {number} seriesId - Series ID
   * @returns {Promise<Object|null>} Custom model settings or null
   */
  async getCustomModel(seriesId) {
    const series = await db.series.get(seriesId)
    return series?.customModel || null
  },

  /**
   * Clear custom model settings for a series
   * @param {number} seriesId - Series ID
   * @returns {Promise<Object>} Updated series
   */
  async clearCustomModel(seriesId) {
    await db.series.update(seriesId, {
      customModel: null,
      updatedAt: new Date()
    })
    return await db.series.get(seriesId)
  }
}
