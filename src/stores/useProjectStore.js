import { create } from 'zustand'
import { temporal } from 'zundo'
import { projectsDb, createBlankPage, DEFAULT_PROJECT_SETTINGS } from '../lib/db'
import { imageAssets } from '../lib/images'
import { saveProjectToFile, loadProjectFromFile } from '../lib/projectFile'

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
      selectedAssetId: null,
      zoom: 1,
      tool: 'select',
      snapToGrid: false,
      snapGridSize: 20,
      showRulers: true,
      showGrid: false,

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
       * @param {string} title - Project title
       * @param {object} settings - Project settings
       * @param {number} seriesId - Series ID (required)
       */
      createProject: async (title, settings = {}, seriesId) => {
        if (!seriesId) {
          throw new Error('seriesId is required when creating a project')
        }
        try {
          const project = await projectsDb.create(title, settings, seriesId)
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
       * Load projects for a specific series
       * @param {number} seriesId - Series ID
       */
      loadProjectsBySeries: async (seriesId) => {
        set({ projectsLoading: true, projectsError: null })
        try {
          const projects = await projectsDb.getBySeriesId(seriesId)
          set({ projects, projectsLoading: false })
        } catch (error) {
          console.error('Failed to load projects by series:', error)
          set({ projectsError: error.message, projectsLoading: false })
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
       * Does NOT auto-save - ProjectPage handles debounced save with thumbnail generation
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
       * Update multiple elements on the current page with the same changes
       * Used for multi-select property editing
       */
      updateElements: (elementIds, updates) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject || !elementIds.length) return

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        const elements = page.elements.map(el =>
          elementIds.includes(el.id) ? { ...el, ...updates } : el
        )

        page.elements = elements
        pages[activePageIndex] = page

        get().updateCurrentProjectLocal({ pages })
      },

      /**
       * Reorder elements (Z-index)
       * Updates both array order (for Konva) and zIndex property (for HTML overlays)
       */
      reorderElements: (elementIds, direction) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        const elements = [...page.elements]

        // Sort selected IDs by their current index to maintain relative order
        const sortedIds = [...elementIds].sort((a, b) => {
          return elements.findIndex(el => el.id === a) - elements.findIndex(el => el.id === b)
        })

        if (direction === 'front') {
          const moving = elements.filter(el => sortedIds.includes(el.id))
          const remaining = elements.filter(el => !sortedIds.includes(el.id))
          page.elements = [...remaining, ...moving]
        } else if (direction === 'back') {
          const moving = elements.filter(el => sortedIds.includes(el.id))
          const remaining = elements.filter(el => !sortedIds.includes(el.id))
          page.elements = [...moving, ...remaining]
        } else if (direction === 'forward') {
          // Move each element one step forward if possible
          for (let i = elements.length - 2; i >= 0; i--) {
            if (sortedIds.includes(elements[i].id) && !sortedIds.includes(elements[i + 1].id)) {
              [elements[i], elements[i + 1]] = [elements[i + 1], elements[i]]
            }
          }
          page.elements = elements
        } else if (direction === 'backward') {
          // Move each element one step backward if possible
          for (let i = 1; i < elements.length; i++) {
            if (sortedIds.includes(elements[i].id) && !sortedIds.includes(elements[i - 1].id)) {
              [elements[i], elements[i - 1]] = [elements[i - 1], elements[i]]
            }
          }
          page.elements = elements
        }

        // Update zIndex property based on new array order
        // This ensures HTML overlays (speech bubbles) respect the same order
        page.elements = page.elements.map((el, index) => ({
          ...el,
          zIndex: index + 1
        }))

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
       * Nudge selected elements (snap-aware)
       * Note: Elements use center-point positioning, but we snap the TOP-LEFT corner to grid
       */
      nudgeSelectedElements: (dx, dy) => {
        const { currentProject, activePageIndex, selectedElementIds, snapToGrid, snapGridSize } = get()
        if (!currentProject || selectedElementIds.length === 0) return

        // Check if value is on a grid line (with small tolerance for floating point)
        const isOnGrid = (val) => {
          const remainder = Math.abs(val % snapGridSize)
          return remainder < 0.001 || remainder > snapGridSize - 0.001
        }

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }

        const elements = page.elements.map(el => {
          if (selectedElementIds.includes(el.id)) {
            let newX = el.x || 0
            let newY = el.y || 0
            const width = el.width || 0
            const height = el.height || 0

            if (snapToGrid) {
              // Convert center position to top-left corner position
              let topLeftX = newX - width / 2
              let topLeftY = newY - height / 2

              // Snap the top-left corner to grid lines
              if (dx !== 0) {
                if (isOnGrid(topLeftX)) {
                  // Already on grid, move to next grid line
                  topLeftX = dx > 0 ? topLeftX + snapGridSize : topLeftX - snapGridSize
                } else {
                  // Not on grid, snap to grid line in direction of movement
                  topLeftX = dx > 0
                    ? Math.ceil(topLeftX / snapGridSize) * snapGridSize
                    : Math.floor(topLeftX / snapGridSize) * snapGridSize
                }
              }
              if (dy !== 0) {
                if (isOnGrid(topLeftY)) {
                  // Already on grid, move to next grid line
                  topLeftY = dy > 0 ? topLeftY + snapGridSize : topLeftY - snapGridSize
                } else {
                  // Not on grid, snap to grid line in direction of movement
                  topLeftY = dy > 0
                    ? Math.ceil(topLeftY / snapGridSize) * snapGridSize
                    : Math.floor(topLeftY / snapGridSize) * snapGridSize
                }
              }

              // Convert back to center position
              newX = topLeftX + width / 2
              newY = topLeftY + height / 2
            } else {
              newX += dx
              newY += dy
            }

            return { ...el, x: newX, y: newY }
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
       * Set snap to grid
       */
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

      /**
       * Set snap grid size
       */
      setSnapGridSize: (snapGridSize) => set({ snapGridSize }),

      /**
       * Set show rulers
       */
      setShowRulers: (showRulers) => set({ showRulers }),

      /**
       * Set show grid
       */
      setShowGrid: (showGrid) => set({ showGrid }),

      /**
       * Save project settings without updating existing pages
       * Used when user wants to change defaults for new pages only
       */
      saveProjectSettings: async (settings) => {
        const { currentProject } = get()
        if (!currentProject) return

        const newProjectSettings = { ...currentProject.settings, ...settings }
        get().updateCurrentProjectLocal({
          settings: newProjectSettings
        })

        // Persist to IndexedDB immediately
        await get().saveCurrentProject()
      },

      /**
       * Update project settings AND apply to all pages
       * Used when user wants to sync all pages to project defaults
       */
      updateProjectSettings: async (settings) => {
        const { currentProject } = get()
        if (!currentProject) return

        // Merge with existing settings
        const newProjectSettings = { ...currentProject.settings, ...settings }

        // Update all pages with new settings
        const updatedPages = currentProject.pages.map(page => ({
          ...page,
          settings: { ...newProjectSettings }
        }))

        get().updateCurrentProjectLocal({
          settings: newProjectSettings,
          pages: updatedPages
        })

        // Persist to IndexedDB immediately
        await get().saveCurrentProject()
      },

      /**
       * Update settings for a specific page only
       */
      updatePageSettings: (pageIndex, settings) => {
        const { currentProject } = get()
        if (!currentProject) return

        const pages = [...currentProject.pages]
        const page = { ...pages[pageIndex] }

        // Merge with existing page settings (or project settings as fallback)
        const currentPageSettings = page.settings || currentProject.settings
        page.settings = { ...currentPageSettings, ...settings }

        pages[pageIndex] = page
        get().updateCurrentProjectLocal({ pages })
      },

      /**
       * Set selected elements
       */
      setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),

      /**
       * Set selected asset
       */
      setSelectedAssetId: (id) => set({ selectedAssetId: id }),

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
       * Save current project as .mycomic file (includes images)
       */
      saveAsMyComic: async () => {
        const { currentProject } = get()
        if (!currentProject) return

        set({ isSaving: true })
        try {
          // First save to IndexedDB
          await get().saveCurrentProject()

          // Then save to .mycomic file
          const result = await saveProjectToFile(currentProject)
          set({ isSaving: false })
          return result
        } catch (error) {
          console.error('Failed to save as .mycomic:', error)
          set({ isSaving: false })
          throw error
        }
      },

      /**
       * Load project from .mycomic file
       */
      loadFromMyComic: async () => {
        try {
          const result = await loadProjectFromFile()
          if (result.success && result.project) {
            // Refresh projects list
            await get().loadProjects()
            return result.project
          }
          return null
        } catch (error) {
          console.error('Failed to load .mycomic file:', error)
          throw error
        }
      },

      /**
       * Add a new page to current project (inherits project settings)
       */
      addPage: async () => {
        const { currentProject } = get()
        if (!currentProject) return

        const newPageNumber = currentProject.pages.length + 1
        const newPage = createBlankPage(newPageNumber, currentProject.settings)

        const updatedPages = [...currentProject.pages, newPage]
        await get().updateCurrentProject({ pages: updatedPages })
        set({ activePageIndex: updatedPages.length - 1 })
      },

      /**
       * Add an image to the project assets and optionally to the current page
       * @param {File} file - The image file to upload
       * @param {Object} options - Options
       * @param {boolean} options.addToCanvas - Whether to add to canvas (default: true)
       * @param {Object} options.aiMetadata - AI generation metadata (prompt, model, style, seed)
       */
      addImage: async (file, { addToCanvas = true, aiMetadata = null } = {}) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        try {
          // 1. Upload to IndexedDB (with optional AI metadata)
          const asset = await imageAssets.upload(currentProject.id, file, aiMetadata || {})

          // 2. Add to project assets if not already there
          const imageIds = [...(currentProject.assets?.imageIds || [])]
          if (!imageIds.includes(asset.id)) {
            imageIds.push(asset.id)
          }

          // If not adding to canvas, just update assets
          if (!addToCanvas) {
            await get().updateCurrentProject({
              assets: { ...currentProject.assets, imageIds }
            })
            return asset
          }

          // 3. Calculate element size maintaining aspect ratio (max = page dimensions)
          const currentPage = currentProject.pages[activePageIndex]
          const pageSettings = currentPage?.settings || currentProject.settings || { width: 800, height: 1200 }
          const maxWidth = pageSettings.width
          const maxHeight = pageSettings.height
          let width = asset.width || 300
          let height = asset.height || 300
          // Scale down if image exceeds page dimensions
          if (width > maxWidth || height > maxHeight) {
            const scaleX = maxWidth / width
            const scaleY = maxHeight / height
            const scale = Math.min(scaleX, scaleY)
            width = Math.round(width * scale)
            height = Math.round(height * scale)
          }

          // 4. Create element on current page (x,y is center point)
          // Get image defaults from project settings
          const imageDefaults = currentProject.settings?.image || DEFAULT_PROJECT_SETTINGS.image
          const newElement = {
            type: 'image',
            id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            assetId: asset.id,
            x: 200,
            y: 200,
            width,
            height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: imageDefaults.opacity ?? 1,
            stroke: imageDefaults.stroke || '#000000',
            strokeWidth: imageDefaults.strokeWidth ?? 0,
            cornerRadius: imageDefaults.cornerRadius ?? 0,
            cornerShape: imageDefaults.cornerShape || 'round',
            lockAspectRatio: true,
            zIndex: (currentProject.pages[activePageIndex].elements?.length || 0) + 1
          }

          const pages = [...currentProject.pages]
          const page = { ...pages[activePageIndex] }
          page.elements = [...(page.elements || []), newElement]
          pages[activePageIndex] = page

          await get().updateCurrentProject({
            assets: { ...currentProject.assets, imageIds },
            pages
          })

          set({ selectedElementIds: [newElement.id] })
          return newElement
        } catch (error) {
          console.error('Failed to add image:', error)
          throw error
        }
      },

      /**
       * Add an existing asset to the current page
       */
      addAssetToPage: async (assetId, position = { x: 200, y: 200 }) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        // Get asset to retrieve dimensions
        const asset = await imageAssets.get(assetId)

        // Calculate element size maintaining aspect ratio (max = page dimensions)
        const currentPage = currentProject.pages[activePageIndex]
        const pageSettings = currentPage?.settings || currentProject.settings || { width: 800, height: 1200 }
        const maxWidth = pageSettings.width
        const maxHeight = pageSettings.height
        let width = asset?.width || 300
        let height = asset?.height || 300
        // Scale down if image exceeds page dimensions
        if (width > maxWidth || height > maxHeight) {
          const scaleX = maxWidth / width
          const scaleY = maxHeight / height
          const scale = Math.min(scaleX, scaleY)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        // Get image defaults from project settings
        const imageDefaults = currentProject.settings?.image || DEFAULT_PROJECT_SETTINGS.image
        const newElement = {
          type: 'image',
          id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          assetId: assetId,
          x: position.x,
          y: position.y,
          width,
          height,
          cropX: 0,
          cropY: 0,
          cropWidth: 1, // Normalized 0-1
          cropHeight: 1, // Normalized 0-1
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: imageDefaults.opacity ?? 1,
          stroke: imageDefaults.stroke || '#000000',
          strokeWidth: imageDefaults.strokeWidth ?? 0,
          cornerRadius: imageDefaults.cornerRadius ?? 0,
          cornerShape: imageDefaults.cornerShape || 'round',
          lockAspectRatio: true,
          zIndex: (currentProject.pages[activePageIndex].elements?.length || 0) + 1
        }

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        page.elements = [...(page.elements || []), newElement]
        pages[activePageIndex] = page

        await get().updateCurrentProject({ pages })
        set({ selectedElementIds: [newElement.id] })
        return newElement
      },

      /**
       * Rename an asset
       */
      renameAsset: async (assetId, newName) => {
        try {
          await imageAssets.rename(assetId, newName)
          // Dispatch event to notify hooks/components
          window.dispatchEvent(new CustomEvent('asset-updated', { detail: { assetId } }))
        } catch (error) {
          console.error('Failed to rename asset:', error)
          throw error
        }
      },

      /**
       * Check if an asset is used on any page
       */
      isAssetUsed: (assetId) => {
        const { currentProject } = get()
        if (!currentProject) return false

        for (const page of currentProject.pages) {
          if (page.elements?.some(el => el.assetId === assetId)) {
            return true
          }
        }
        return false
      },

      /**
       * Count how many times an asset is used across all pages
       */
      getAssetUsageCount: (assetId) => {
        const { currentProject } = get()
        if (!currentProject) return 0

        let count = 0
        for (const page of currentProject.pages) {
          count += (page.elements || []).filter(el => el.assetId === assetId).length
        }
        return count
      },

      /**
       * Get asset IDs used on a specific page
       */
      getAssetsOnPage: (pageIndex) => {
        const { currentProject } = get()
        if (!currentProject) return []

        const page = currentProject.pages[pageIndex]
        if (!page?.elements) return []

        const assetIds = new Set()
        for (const el of page.elements) {
          if (el.assetId) {
            assetIds.add(el.assetId)
          }
        }
        return Array.from(assetIds)
      },

      /**
       * Delete an asset and remove it from all pages
       */
      deleteAsset: async (assetId) => {
        const { currentProject, selectedAssetId } = get()
        if (!currentProject) return

        try {
          // 1. Remove from all page elements
          const pages = currentProject.pages.map(page => ({
            ...page,
            elements: (page.elements || []).filter(el => el.assetId !== assetId)
          }))

          // 2. Remove from project asset list
          const imageIds = (currentProject.assets?.imageIds || []).filter(id => id !== assetId)

          // 3. Update project
          await get().updateCurrentProject({
            pages,
            assets: { ...currentProject.assets, imageIds }
          })

          // 4. Delete from IndexedDB
          await imageAssets.delete(assetId)

          // 5. Clear selection if this asset was selected
          if (selectedAssetId === assetId) {
            set({ selectedAssetId: null })
          }

          // Dispatch event to notify hooks/components
          window.dispatchEvent(new CustomEvent('asset-deleted', { detail: { assetId } }))
        } catch (error) {
          console.error('Failed to delete asset:', error)
          throw error
        }
      },

      /**
       * Add a speech bubble to the current page
       * Uses project settings for default styling
       */
      addSpeechBubble: async (position = { x: 200, y: 200 }) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        // Get speech bubble defaults from project settings (with backward compatibility)
        const bubbleDefaults = currentProject.settings?.speechBubble || DEFAULT_PROJECT_SETTINGS.speechBubble
        // Backward compatibility: check for old defaultFont at root level
        const fontFamily = bubbleDefaults.fontFamily || currentProject.settings?.defaultFont || 'Comic Neue, cursive'

        const newElement = {
          type: 'speechBubble',
          id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          x: position.x,
          y: position.y,
          width: 200,
          height: 120,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          fill: bubbleDefaults.fill || '#FFFFFF',
          stroke: bubbleDefaults.stroke || '#000000',
          strokeWidth: bubbleDefaults.strokeWidth || 2,
          bubbleStyle: bubbleDefaults.bubbleStyle || 'round',
          cornerRadius: 20,
          text: 'Double-click to edit',
          fontSize: bubbleDefaults.fontSize || 16,
          fontFamily: fontFamily,
          textColor: bubbleDefaults.textColor || '#000000',
          textAlign: 'center',
          verticalAlign: 'middle',
          padding: 10,
          zIndex: (currentProject.pages[activePageIndex].elements?.length || 0) + 1
        }

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        page.elements = [...(page.elements || []), newElement]
        pages[activePageIndex] = page

        await get().updateCurrentProject({ pages })
        set({ selectedElementIds: [newElement.id] })
        return newElement
      },

      /**
       * Add a text element to the current page
       * Uses project settings for default styling
       */
      addText: async (position = { x: 200, y: 200 }) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        // Get text defaults from project settings (with backward compatibility)
        const textDefaults = currentProject.settings?.text || DEFAULT_PROJECT_SETTINGS.text
        // Backward compatibility: check for old defaultFont at root level
        const fontFamily = textDefaults.fontFamily || currentProject.settings?.defaultFont || 'Comic Neue, cursive'

        const newElement = {
          type: 'text',
          id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          x: position.x,
          y: position.y,
          width: 200,
          height: 60,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          text: 'Double-click to edit',
          fontSize: textDefaults.fontSize || 24,
          fontFamily: fontFamily,
          fontWeight: textDefaults.fontWeight || 'normal',
          fontStyle: 'normal',
          textColor: textDefaults.textColor || '#000000',
          strokeColor: textDefaults.strokeColor || '#000000',
          strokeWidth: textDefaults.strokeWidth || 0,
          textAlign: textDefaults.textAlign || 'center',
          verticalAlign: 'middle',
          padding: 8,
          zIndex: (currentProject.pages[activePageIndex].elements?.length || 0) + 1
        }

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        page.elements = [...(page.elements || []), newElement]
        pages[activePageIndex] = page

        await get().updateCurrentProject({ pages })
        set({ selectedElementIds: [newElement.id] })
        return newElement
      },

      /**
       * Add a text effect element to the current page
       * Uses project settings for default styling
       */
      addTextEffect: async (position = { x: 200, y: 200 }) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return

        // Get text effect defaults from project settings
        const defaults = currentProject.settings?.textEffect || DEFAULT_PROJECT_SETTINGS.textEffect

        const newElement = {
          type: 'textEffect',
          id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          x: position.x,
          y: position.y,
          width: 200,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          text: defaults.text || 'EFFECT!',
          fontFamily: defaults.fontFamily || 'Bangers, cursive',
          fontWeight: 'bold',
          fontSize: defaults.fontSize || 64,
          letterSpacing: defaults.letterSpacing || 2,
          textAlign: 'center',
          fill: defaults.fill || '#FFFF00',
          stroke: defaults.stroke || '#000000',
          strokeWidth: defaults.strokeWidth || 3,
          outerStroke: defaults.outerStroke || '#FF0000',
          outerStrokeWidth: defaults.outerStrokeWidth || 4,
          zIndex: (currentProject.pages[activePageIndex].elements?.length || 0) + 1
        }

        const pages = [...currentProject.pages]
        const page = { ...pages[activePageIndex] }
        page.elements = [...(page.elements || []), newElement]
        pages[activePageIndex] = page

        await get().updateCurrentProject({ pages })
        set({ selectedElementIds: [newElement.id] })
        return newElement
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
       * Reorder pages by moving a page from one index to another
       */
      reorderPages: async (fromIndex, toIndex) => {
        const { currentProject, activePageIndex } = get()
        if (!currentProject) return
        if (fromIndex === toIndex) return
        if (fromIndex < 0 || fromIndex >= currentProject.pages.length) return
        if (toIndex < 0 || toIndex >= currentProject.pages.length) return

        const pages = [...currentProject.pages]
        const [movedPage] = pages.splice(fromIndex, 1)
        pages.splice(toIndex, 0, movedPage)

        // Update page numbers
        const updatedPages = pages.map((page, i) => ({ ...page, pageNumber: i + 1 }))

        // Update active page index to follow the moved page if needed
        let newActiveIndex = activePageIndex
        if (activePageIndex === fromIndex) {
          newActiveIndex = toIndex
        } else if (fromIndex < activePageIndex && toIndex >= activePageIndex) {
          newActiveIndex = activePageIndex - 1
        } else if (fromIndex > activePageIndex && toIndex <= activePageIndex) {
          newActiveIndex = activePageIndex + 1
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

