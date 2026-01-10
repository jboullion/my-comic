import { create } from 'zustand'
import { seriesDb } from '../lib/series'

/**
 * Series Store
 *
 * Manages the series library state.
 * Series group projects and characters together.
 */
export const useSeriesStore = create((set, get) => ({
  // Series list
  series: [],
  seriesLoading: true,
  seriesError: null,

  // Selected series (for filtering views)
  selectedSeriesId: null,

  // Modal state
  isSeriesModalOpen: false,
  editingSeries: null, // null for new, series object for edit

  // ==================
  // Series Actions
  // ==================

  /**
   * Load all series from IndexedDB (with counts and cover images)
   */
  loadSeries: async () => {
    set({ seriesLoading: true, seriesError: null })
    try {
      const series = await seriesDb.getAllWithCountsAndImages()
      set({ series, seriesLoading: false })
    } catch (error) {
      console.error('Failed to load series:', error)
      set({ seriesError: error.message, seriesLoading: false })
    }
  },

  /**
   * Get a single series by ID (from cache or fetch)
   */
  getSeriesById: (id) => {
    const { series } = get()
    return series.find((s) => s.id === id)
  },

  /**
   * Create a new series
   */
  createSeries: async (name, description = '') => {
    try {
      const newSeries = await seriesDb.create(name, description)
      // Add counts for the new series
      newSeries.projectCount = 0
      newSeries.characterCount = 0
      set((state) => ({
        series: [...state.series, newSeries].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        isSeriesModalOpen: false,
        editingSeries: null
      }))
      return newSeries
    } catch (error) {
      console.error('Failed to create series:', error)
      throw error
    }
  },

  /**
   * Update an existing series
   */
  updateSeries: async (id, updates) => {
    try {
      const updated = await seriesDb.update(id, updates)
      // Reload with counts and cover image
      const withData = await seriesDb.getByIdWithCountsAndImage(id)
      set((state) => ({
        series: state.series
          .map((s) => (s.id === id ? withData : s))
          .sort((a, b) => a.name.localeCompare(b.name)),
        isSeriesModalOpen: false,
        editingSeries: null
      }))
      return updated
    } catch (error) {
      console.error('Failed to update series:', error)
      throw error
    }
  },

  /**
   * Delete a series (moves items to Uncategorized)
   */
  deleteSeries: async (id) => {
    try {
      await seriesDb.delete(id)
      // Reload all series to get updated counts and images
      const series = await seriesDb.getAllWithCountsAndImages()
      set((state) => ({
        series,
        selectedSeriesId: state.selectedSeriesId === id ? null : state.selectedSeriesId
      }))
    } catch (error) {
      console.error('Failed to delete series:', error)
      throw error
    }
  },

  /**
   * Get the Uncategorized series
   */
  getUncategorizedSeries: async () => {
    try {
      return await seriesDb.getUncategorized()
    } catch (error) {
      console.error('Failed to get Uncategorized series:', error)
      throw error
    }
  },

  /**
   * Refresh counts for all series (after project/character changes)
   */
  refreshSeriesCounts: async () => {
    try {
      const series = await seriesDb.getAllWithCountsAndImages()
      set({ series })
    } catch (error) {
      console.error('Failed to refresh series counts:', error)
    }
  },

  // ==================
  // Cover Image Actions
  // ==================

  /**
   * Set a cover image for a series
   */
  setSeriesCoverImage: async (seriesId, file) => {
    try {
      await seriesDb.setCoverImage(seriesId, file)
      // Reload series with updated image
      const withData = await seriesDb.getByIdWithCountsAndImage(seriesId)
      set((state) => ({
        series: state.series.map((s) => (s.id === seriesId ? withData : s))
      }))
    } catch (error) {
      console.error('Failed to set cover image:', error)
      throw error
    }
  },

  /**
   * Remove cover image from a series
   */
  removeSeriesCoverImage: async (seriesId) => {
    try {
      await seriesDb.removeCoverImage(seriesId)
      // Reload series with removed image
      const withData = await seriesDb.getByIdWithCountsAndImage(seriesId)
      set((state) => ({
        series: state.series.map((s) => (s.id === seriesId ? withData : s))
      }))
    } catch (error) {
      console.error('Failed to remove cover image:', error)
      throw error
    }
  },

  // ==================
  // Custom Model Actions
  // ==================

  /**
   * Update custom AI model settings for a series
   */
  updateSeriesCustomModel: async (seriesId, customModel) => {
    try {
      await seriesDb.updateCustomModel(seriesId, customModel)
      // Reload series with updated data
      const withData = await seriesDb.getByIdWithCountsAndImage(seriesId)
      set((state) => ({
        series: state.series.map((s) => (s.id === seriesId ? withData : s))
      }))
    } catch (error) {
      console.error('Failed to update custom model:', error)
      throw error
    }
  },

  /**
   * Get custom model for a series (from cache)
   */
  getSeriesCustomModel: (seriesId) => {
    const { series } = get()
    const s = series.find((s) => s.id === seriesId)
    return s?.customModel || null
  },

  // ==================
  // UI Actions
  // ==================

  /**
   * Open the series modal for creating/editing
   */
  openSeriesModal: (series = null) => {
    set({
      isSeriesModalOpen: true,
      editingSeries: series
    })
  },

  /**
   * Close the series modal
   */
  closeSeriesModal: () => {
    set({
      isSeriesModalOpen: false,
      editingSeries: null
    })
  },

  /**
   * Set the selected series (for filtering)
   */
  setSelectedSeriesId: (id) => {
    set({ selectedSeriesId: id })
  }
}))

export default useSeriesStore
