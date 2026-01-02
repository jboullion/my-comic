import { create } from 'zustand'
import { projectsDb, createBlankPage } from '../lib/db'

/**
 * Project Store
 * 
 * Manages the current project state and project list.
 * Uses Dexie (IndexedDB) for persistence.
 */
export const useProjectStore = create((set, get) => ({
  // Project list (for Projects page)
  projects: [],
  projectsLoading: true,
  projectsError: null,

  // Current project (for Project editor)
  currentProject: null,
  currentProjectLoading: false,
  currentProjectError: null,
  hasUnsavedChanges: false,

  // UI State
  isNewProjectModalOpen: false,
  isSaving: false,

  // ==================
  // Project List Actions
  // ==================

  /**
   * Load all projects from IndexedDB
   */
  loadProjects: async () => {
    set({ projectsLoading: true, projectsError: null })
    try {
      const projects = await projectsDb.getAll()
      set({ projects, projectsLoading: false })
    } catch (error) {
      console.error('Failed to load projects:', error)
      set({ projectsError: error.message, projectsLoading: false })
    }
  },

  /**
   * Create a new project
   */
  createProject: async (title, settings = {}) => {
    try {
      const project = await projectsDb.create(title, settings)
      set((state) => ({
        projects: [project, ...state.projects],
        isNewProjectModalOpen: false,
      }))
      return project
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  },

  /**
   * Delete a project
   */
  deleteProject: async (id) => {
    try {
      await projectsDb.delete(id)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  },

  // ==================
  // Current Project Actions
  // ==================

  /**
   * Load a project by ID for editing
   */
  loadProject: async (id) => {
    set({ currentProjectLoading: true, currentProjectError: null })
    try {
      const project = await projectsDb.getById(Number(id))
      if (!project) {
        throw new Error('Project not found')
      }
      set({ currentProject: project, currentProjectLoading: false, hasUnsavedChanges: false })
      return project
    } catch (error) {
      console.error('Failed to load project:', error)
      set({ currentProjectError: error.message, currentProjectLoading: false })
      throw error
    }
  },

  /**
   * Update current project (in memory + IndexedDB)
   */
  updateCurrentProject: async (updates) => {
    const { currentProject } = get()
    if (!currentProject) return

    try {
      const updatedProject = await projectsDb.update(currentProject.id, updates)
      set({ currentProject: updatedProject, hasUnsavedChanges: false })
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  },

  /**
   * Update current project in memory only (for frequent updates like canvas changes)
   */
  updateCurrentProjectLocal: (updates) => {
    const { currentProject } = get()
    if (!currentProject) return

    set({
      currentProject: { ...currentProject, ...updates },
      hasUnsavedChanges: true,
    })
  },

  /**
   * Save current project to IndexedDB
   */
  saveCurrentProject: async () => {
    const { currentProject } = get()
    if (!currentProject) return

    set({ isSaving: true })
    try {
      await projectsDb.update(currentProject.id, {
        title: currentProject.title,
        settings: currentProject.settings,
        pages: currentProject.pages,
      })
      set({ hasUnsavedChanges: false, isSaving: false })
    } catch (error) {
      console.error('Failed to save project:', error)
      set({ isSaving: false })
      throw error
    }
  },

  /**
   * Save current project to file system
   */
  saveToFile: async () => {
    const { currentProject } = get()
    if (!currentProject) return

    set({ isSaving: true })
    try {
      // First save to IndexedDB
      await get().saveCurrentProject()
      
      // Then save to file
      const result = await projectsDb.saveToFile(currentProject, currentProject.fileHandle)
      
      if (result.handle) {
        // Update project with file handle
        set((state) => ({
          currentProject: { ...state.currentProject, fileHandle: result.handle },
        }))
      }
      
      set({ isSaving: false })
      return result
    } catch (error) {
      console.error('Failed to save to file:', error)
      set({ isSaving: false })
      throw error
    }
  },

  /**
   * Open project from file
   */
  openFromFile: async () => {
    try {
      const result = await projectsDb.openFromFile()
      if (result.success && result.project) {
        // Refresh projects list
        await get().loadProjects()
        return result.project
      }
      return null
    } catch (error) {
      console.error('Failed to open from file:', error)
      throw error
    }
  },

  /**
   * Add a new page to current project
   */
  addPage: async () => {
    const { currentProject } = get()
    if (!currentProject) return

    const newPageNumber = currentProject.pages.length + 1
    const newPage = createBlankPage(newPageNumber)
    
    const updatedPages = [...currentProject.pages, newPage]
    await get().updateCurrentProject({ pages: updatedPages })
  },

  /**
   * Delete a page from current project
   */
  deletePage: async (pageIndex) => {
    const { currentProject } = get()
    if (!currentProject || currentProject.pages.length <= 1) return

    const updatedPages = currentProject.pages
      .filter((_, i) => i !== pageIndex)
      .map((page, i) => ({ ...page, pageNumber: i + 1 }))
    
    await get().updateCurrentProject({ pages: updatedPages })
  },

  /**
   * Clear current project (when navigating away)
   */
  clearCurrentProject: () => {
    set({ currentProject: null, hasUnsavedChanges: false, currentProjectError: null })
  },

  // ==================
  // UI Actions
  // ==================

  openNewProjectModal: () => set({ isNewProjectModalOpen: true }),
  closeNewProjectModal: () => set({ isNewProjectModalOpen: false }),
}))

export default useProjectStore
