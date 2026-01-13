import { db } from './db'

/**
 * Character Image Optimization
 * Converts uploaded images to WebP format with reasonable quality
 */
async function optimizeCharacterImage(file, maxWidth = 512) {
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
              resolve({ blob, width, height })
            } else {
              reject(new Error('Canvas toBlob failed'))
            }
          },
          'image/webp',
          0.85
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
 * Characters Database Operations
 */
export const charactersDb = {
  /**
   * Create a new character
   * @param {string} name - Character name
   * @param {string} description - AI prompt description
   * @param {number|null} seriesId - Series ID (optional, null for uncategorized)
   * @param {Object} loraData - Optional LoRA configuration
   * @param {string} loraData.loraUrl - CivitAI or direct LoRA URL
   * @param {string} loraData.loraTriggerWord - Trigger word for LoRA
   * @param {number} loraData.loraScale - LoRA strength (0-1)
   * @returns {Promise<Object>} Created character
   */
  async create(name, description = '', seriesId = null, loraData = {}) {
    const now = new Date()
    const character = {
      name: name || 'Unnamed Character',
      description,
      seriesId,
      profileImageId: null,
      loraUrl: loraData.loraUrl || null,
      loraTriggerWord: loraData.loraTriggerWord || null,
      loraScale: loraData.loraScale ?? 0.8,
      createdAt: now,
      updatedAt: now
    }

    const id = await db.characters.add(character)
    return { ...character, id }
  },

  /**
   * Get all characters
   * @returns {Promise<Array>} All characters sorted by name
   */
  async getAll() {
    return await db.characters.orderBy('name').toArray()
  },

  /**
   * Get all characters in a specific series
   * @param {number} seriesId - Series ID
   * @returns {Promise<Array>} Characters sorted by name
   */
  async getBySeriesId(seriesId) {
    return await db.characters.where('seriesId').equals(seriesId).sortBy('name')
  },

  /**
   * Get a character by ID
   * @param {number} id - Character ID
   * @returns {Promise<Object|undefined>}
   */
  async getById(id) {
    return await db.characters.get(id)
  },

  /**
   * Update a character
   * @param {number} id - Character ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated character
   */
  async update(id, updates) {
    await db.characters.update(id, {
      ...updates,
      updatedAt: new Date()
    })
    return await db.characters.get(id)
  },

  /**
   * Delete a character and all its images
   * @param {number} id - Character ID
   */
  async delete(id) {
    // Delete all character images first
    await db.characterImages.where('characterId').equals(id).delete()
    // Delete the character
    await db.characters.delete(id)
  },

  /**
   * Add an image to a character
   * @param {number} characterId - Character ID
   * @param {File} file - Image file
   * @param {string} type - 'profile' or 'reference'
   * @returns {Promise<Object>} Created character image
   */
  async addImage(characterId, file, type = 'reference') {
    // Optimize the image
    const { blob, width, height } = await optimizeCharacterImage(file)

    const characterImage = {
      characterId,
      type,
      blob,
      width,
      height,
      name: file.name,
      createdAt: new Date()
    }

    const id = await db.characterImages.add(characterImage)
    const savedImage = { ...characterImage, id }

    // If this is a profile image, update the character's profileImageId
    if (type === 'profile') {
      await this.setProfileImage(characterId, id)
    }

    return savedImage
  },

  /**
   * Remove a character image
   * @param {number} imageId - Character image ID
   */
  async removeImage(imageId) {
    // Check if this is a profile image and clear it from the character
    const image = await db.characterImages.get(imageId)
    if (image) {
      const character = await db.characters.get(image.characterId)
      if (character && character.profileImageId === imageId) {
        await db.characters.update(image.characterId, {
          profileImageId: null,
          updatedAt: new Date()
        })
      }
    }
    await db.characterImages.delete(imageId)
  },

  /**
   * Get all images for a character
   * @param {number} characterId - Character ID
   * @returns {Promise<Array>} Character images
   */
  async getImages(characterId) {
    return await db.characterImages
      .where('characterId')
      .equals(characterId)
      .toArray()
  },

  /**
   * Get a single character image
   * @param {number} imageId - Character image ID
   * @returns {Promise<Object|undefined>}
   */
  async getImage(imageId) {
    return await db.characterImages.get(imageId)
  },

  /**
   * Set the profile image for a character
   * @param {number} characterId - Character ID
   * @param {number} imageId - Character image ID
   */
  async setProfileImage(characterId, imageId) {
    // Update the image type to profile
    await db.characterImages.update(imageId, { type: 'profile' })

    // Update the character's profileImageId
    await db.characters.update(characterId, {
      profileImageId: imageId,
      updatedAt: new Date()
    })
  },

  /**
   * Get character with its profile image loaded
   * @param {number} id - Character ID
   * @returns {Promise<Object|undefined>} Character with profileImage property
   */
  async getWithProfileImage(id) {
    const character = await db.characters.get(id)
    if (!character) return undefined

    if (character.profileImageId) {
      character.profileImage = await db.characterImages.get(character.profileImageId)
    }

    return character
  },

  /**
   * Get all characters with their profile images
   * @returns {Promise<Array>} Characters with profileImage property
   */
  async getAllWithProfileImages() {
    const characters = await db.characters.orderBy('name').toArray()

    // Load profile images for each character
    for (const character of characters) {
      if (character.profileImageId) {
        character.profileImage = await db.characterImages.get(character.profileImageId)
      }
    }

    return characters
  },

  /**
   * Get all characters in a series with their profile images
   * @param {number} seriesId - Series ID
   * @returns {Promise<Array>} Characters with profileImage property
   */
  async getAllWithProfileImagesBySeries(seriesId) {
    const characters = await db.characters.where('seriesId').equals(seriesId).sortBy('name')

    // Load profile images for each character
    for (const character of characters) {
      if (character.profileImageId) {
        character.profileImage = await db.characterImages.get(character.profileImageId)
      }
    }

    return characters
  }
}
