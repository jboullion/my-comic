import { create } from 'zustand'
import { charactersDb } from '../lib/characters'

/**
 * Characters Store
 *
 * Manages the global characters library state.
 * Characters are series-scoped (belong to a specific series).
 */
export const useCharactersStore = create((set) => ({
  // Characters list
  characters: [],
  charactersLoading: false, // Start as false - no loading in progress yet
  charactersError: null,

  // Selected character (for viewing/editing)
  selectedCharacterId: null,

  // Modal state
  isCharacterModalOpen: false,
  editingCharacter: null, // null for new, character object for edit

  // ==================
  // Characters Actions
  // ==================

  /**
   * Load all characters from IndexedDB
   */
  loadCharacters: async () => {
    set({ charactersLoading: true, charactersError: null })
    try {
      const characters = await charactersDb.getAllWithProfileImages()
      set({ characters, charactersLoading: false })
    } catch (error) {
      console.error('Failed to load characters:', error)
      set({ charactersError: error.message, charactersLoading: false })
    }
  },

  /**
   * Create a new character
   * @param {string} name - Character name
   * @param {string} description - Character description
   * @param {number} seriesId - Series ID (required)
   * @param {Object} loraData - Optional LoRA configuration
   */
  createCharacter: async (name, description = '', seriesId, loraData = {}) => {
    if (!seriesId) {
      throw new Error('seriesId is required when creating a character')
    }
    try {
      const character = await charactersDb.create(name, description, seriesId, loraData)
      set((state) => ({
        characters: [...state.characters, character].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        isCharacterModalOpen: false,
        editingCharacter: null
      }))
      return character
    } catch (error) {
      console.error('Failed to create character:', error)
      throw error
    }
  },

  /**
   * Load characters for a specific series
   * @param {number} seriesId - Series ID
   */
  loadCharactersBySeries: async (seriesId) => {
    set({ charactersLoading: true, charactersError: null })
    try {
      const characters = await charactersDb.getAllWithProfileImagesBySeries(seriesId)
      set({ characters, charactersLoading: false })
    } catch (error) {
      console.error('Failed to load characters by series:', error)
      set({ charactersError: error.message, charactersLoading: false })
    }
  },

  /**
   * Update an existing character
   */
  updateCharacter: async (id, updates) => {
    try {
      const updated = await charactersDb.update(id, updates)
      // Reload to get fresh profile image data
      const withImage = await charactersDb.getWithProfileImage(id)
      set((state) => ({
        characters: state.characters
          .map((c) => (c.id === id ? withImage : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
        isCharacterModalOpen: false,
        editingCharacter: null
      }))
      return updated
    } catch (error) {
      console.error('Failed to update character:', error)
      throw error
    }
  },

  /**
   * Delete a character
   */
  deleteCharacter: async (id) => {
    try {
      await charactersDb.delete(id)
      set((state) => ({
        characters: state.characters.filter((c) => c.id !== id),
        selectedCharacterId:
          state.selectedCharacterId === id ? null : state.selectedCharacterId
      }))
    } catch (error) {
      console.error('Failed to delete character:', error)
      throw error
    }
  },

  /**
   * Add an image to a character
   */
  addCharacterImage: async (characterId, file, type = 'reference') => {
    try {
      const image = await charactersDb.addImage(characterId, file, type)
      // Reload the character to get updated profile image
      const updated = await charactersDb.getWithProfileImage(characterId)
      set((state) => ({
        characters: state.characters.map((c) =>
          c.id === characterId ? updated : c
        )
      }))
      return image
    } catch (error) {
      console.error('Failed to add character image:', error)
      throw error
    }
  },

  /**
   * Remove an image from a character
   */
  removeCharacterImage: async (imageId) => {
    try {
      // Get the image first to know which character to update
      const image = await charactersDb.getImage(imageId)
      if (!image) return

      await charactersDb.removeImage(imageId)

      // Reload the character to get updated data
      const updated = await charactersDb.getWithProfileImage(image.characterId)
      set((state) => ({
        characters: state.characters.map((c) =>
          c.id === image.characterId ? updated : c
        )
      }))
    } catch (error) {
      console.error('Failed to remove character image:', error)
      throw error
    }
  },

  /**
   * Set profile image for a character
   */
  setProfileImage: async (characterId, imageId) => {
    try {
      await charactersDb.setProfileImage(characterId, imageId)
      // Reload the character to get updated profile image
      const updated = await charactersDb.getWithProfileImage(characterId)
      set((state) => ({
        characters: state.characters.map((c) =>
          c.id === characterId ? updated : c
        )
      }))
    } catch (error) {
      console.error('Failed to set profile image:', error)
      throw error
    }
  },

  /**
   * Get character images
   */
  getCharacterImages: async (characterId) => {
    try {
      return await charactersDb.getImages(characterId)
    } catch (error) {
      console.error('Failed to get character images:', error)
      throw error
    }
  },

  // ==================
  // UI Actions
  // ==================

  /**
   * Open the character modal for creating/editing
   */
  openCharacterModal: (character = null) => {
    set({
      isCharacterModalOpen: true,
      editingCharacter: character
    })
  },

  /**
   * Close the character modal
   */
  closeCharacterModal: () => {
    set({
      isCharacterModalOpen: false,
      editingCharacter: null
    })
  },

  /**
   * Set the selected character
   */
  setSelectedCharacterId: (id) => {
    set({ selectedCharacterId: id })
  }
}))

export default useCharactersStore
