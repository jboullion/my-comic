import { create } from 'zustand'
import { temporal } from 'zundo'
import { debounce } from 'lodash-es'
import { projectsDb, createBlankPage } from '../lib/db'

/**
 * Project Store
 * 
 * Manages the current project state and project list.
 * Uses Dexie (IndexedDB) for persistence.
 */
export const useProjectStore = create(
  temporal(
    (set, get) => ({
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
      activePageIndex: 0,
      selectedElementIds: [],
      zoom: 1,
      tool: 'select',

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
          set({ 
            currentProject: project, 
            currentProjectLoading: false, 
            hasUnsavedChanges: false,
            activePageIndex: 0,
            selectedElementIds: [],
            zoom: 1,
            tool: 'select'
          })
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

        // Debounced save to IndexedDB
        get().debouncedSave()
      },

      /**
       * Debounced save to IndexedDB
       */
      debouncedSave: debounce(async () => {
        const { currentProject, hasUnsavedChanges } = get()
        if (!currentProject || !hasUnsavedChanges) return

        try {
          await projectsDb.update(currentProject.id, {
            title: currentProject.title,
            settings: currentProject.settings,
            pages: currentProject.pages,
            assets: currentProject.assets,
          })
          set({ hasUnsavedChanges: false })
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }, 1000),

      /**
       * Save current project to IndexedDB immediately
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
            assets: currentProject.assets,
          })
          set({ hasUnsavedChanges: false, isSaving: false })
        } catch (error) {
          console.error('Failed to save project:', error)
          set({ isSaving: false })
          throw error
        }
      },

      /**
       * Update a specific element on the current page
       */
      updateElement: (elementId, updates) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        const elements = page.elements.map(el => 
          el.id === elementId ? { ...el, ...updates } : el
        )
        
        page.elements = elements
        pages[activePageIndex] = page

        get().updateCurrentProjectLocal({ pages })
      },

      /**
       * Delete selected elements
       */
      deleteSelectedElements: () => {
        const { currentProject, activePageIndex, selectedElementIds } = get()
        if (!currentProject || selectedElementIds.length === 0) return

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        const elements = page.elements.filter(el => !selectedElementIds.includes(el.id))
        
        page.elements = elements
        pages[activePageIndex] = page

        get().updateCurrentProjectLocal({ pages })
        set({ selectedElementIds: [] })
      },

      /**
       * Nudge selected elements
       */
      nudgeSelectedElements: (dx, dy) => {
        const { currentProject, activePageIndex, selectedElementIds } = get()
        if (!currentProject || selectedElementIds.length === 0) return

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        const elements = page.elements.map(el => {
          if (selectedElementIds.includes(el.id)) {
            return { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy }
          }
          return el
        })
        
        page.elements = elements
        pages[activePageIndex] = page

        get().updateCurrentProjectLocal({ pages })
      },

      /**
       * Set active page index
       */
      setActivePageIndex: (index) => set({ activePageIndex: index }),

      /**
       * Set zoom level
       */
      setZoom: (zoom) => set({ zoom }),

      /**
       * Set current tool
       */
      setTool: (tool) => set({ tool }),

      /**
       * Set selected elements
       */
      setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),

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
        set({ activePageIndex: updatedPages.length - 1 })
      },

      /**
       * Delete a page from current project
       */
      deletePage: async (pageIndex) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject || currentProject.pages.length <= 1) return

        const updatedPages = currentProject.pages
          .filter((_, i) => i !== pageIndex)
          .map((page, i) => ({ ...page, pageNumber: i + 1 }))
        
        let newActiveIndex = activePageIndex
        if (activePageIndex >= updatedPages.length) {
          newActiveIndex = updatedPages.length - 1
        }

        await get().updateCurrentProject({ pages: updatedPages })
        set({ activePageIndex: newActiveIndex })
      },

      /**
       * Clear current project (when navigating away)
       */
      clearCurrentProject: () => {
        set({ 
          currentProject: null, 
          hasUnsavedChanges: false, 
          currentProjectError: null,
          activePageIndex: 0,
          selectedElementIds: [],
          zoom: 1,
          tool: 'select'
        })
      },

      // ==================
      // UI Actions
      // ==================

      openNewProjectModal: () => set({ isNewProjectModalOpen: true }),
      closeNewProjectModal: () => set({ isNewProjectModalOpen: false }),
    }),
    {
      limit: 50,
      partialize: (state) => ({
        currentProject: state.currentProject,
      }),
    }
  )
)

export default useProjectStore

