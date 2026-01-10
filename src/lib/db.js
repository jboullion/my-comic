import Dexie from 'dexie'

/**
 * Comic Book Maker IndexedDB Database
 * 
 * Stores projects locally for auto-save and offline access.
 * Projects can optionally be saved to the file system via File System Access API.
 */
export const db = new Dexie('ComicBookMaker')

// Database schema
db.version(3).stores({
  // Projects table - stores project metadata and content
  projects: '++id, title, createdAt, updatedAt, fileHandle',
  // Images table - stores heavy binary data separately for performance
  // Added compound index [projectId+hash] for faster deduplication checks
  images: '++id, projectId, hash, [projectId+hash], name, size, type, createdAt',
})

// Version 4: Add Characters feature (global user-level characters)
db.version(4).stores({
  projects: '++id, title, createdAt, updatedAt, fileHandle',
  images: '++id, projectId, hash, [projectId+hash], name, size, type, createdAt',
  // Characters table - user-level, not tied to projects
  characters: '++id, name, createdAt, updatedAt',
  // Character images - profile pictures and reference images
  characterImages: '++id, characterId, type, createdAt'
})

// Version 5: Add Series feature - groups projects and characters
db.version(5).stores({
  projects: '++id, title, seriesId, createdAt, updatedAt, fileHandle',
  images: '++id, projectId, hash, [projectId+hash], name, size, type, createdAt',
  characters: '++id, name, seriesId, createdAt, updatedAt',
  characterImages: '++id, characterId, type, createdAt',
  series: '++id, name, createdAt, updatedAt'
}).upgrade(async (tx) => {
  // Create "Uncategorized" series for existing data
  const uncategorizedId = await tx.table('series').add({
    name: 'Uncategorized',
    description: 'Default series for projects and characters',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // Migrate all existing projects to the Uncategorized series
  await tx.table('projects').toCollection().modify({ seriesId: uncategorizedId })

  // Migrate all existing characters to the Uncategorized series
  await tx.table('characters').toCollection().modify({ seriesId: uncategorizedId })
})

// Version 6: Add series cover images
db.version(6).stores({
  projects: '++id, title, seriesId, createdAt, updatedAt, fileHandle',
  images: '++id, projectId, hash, [projectId+hash], name, size, type, createdAt',
  characters: '++id, name, seriesId, createdAt, updatedAt',
  characterImages: '++id, characterId, type, createdAt',
  series: '++id, name, createdAt, updatedAt',
  seriesImages: '++id, seriesId, createdAt'
})

// Version 7: Add LoRA fields to characters (no index changes needed)
db.version(7).stores({
  projects: '++id, title, seriesId, createdAt, updatedAt, fileHandle',
  images: '++id, projectId, hash, [projectId+hash], name, size, type, createdAt',
  characters: '++id, name, seriesId, createdAt, updatedAt',
  characterImages: '++id, characterId, type, createdAt',
  series: '++id, name, createdAt, updatedAt',
  seriesImages: '++id, seriesId, createdAt'
})

/**
 * Series schema:
 * {
 *   id: number (auto-increment)
 *   name: string
 *   description: string
 *   coverImageId: number | null (FK to seriesImages)
 *   createdAt: Date
 *   updatedAt: Date
 * }
 *
 * SeriesImage schema:
 * {
 *   id: number (auto-increment)
 *   seriesId: number (FK to series)
 *   blob: Blob (WebP image data)
 *   width: number
 *   height: number
 *   name: string
 *   createdAt: Date
 * }
 *
 * Project schema:
 * {
 *   id: number (auto-increment)
 *   title: string
 *   seriesId: number (FK to series)
 *   createdAt: Date
 *   updatedAt: Date
 *   fileHandle: FileSystemFileHandle | null (for File System Access API)
 *   settings: ProjectSettings
 *   assets: { imageIds: string[] }
 *   pages: Page[]
 * }
 *
 * Page schema:
 * {
 *   id: string
 *   pageNumber: number
 *   settings: { width, height, backgroundColor }
 *   panels: Panel[]
 *   elements: Element[]
 *   createdAt: Date
 *   updatedAt: Date
 * }
 *
 * Character schema:
 * {
 *   id: number (auto-increment)
 *   name: string
 *   description: string (AI prompt description)
 *   seriesId: number (FK to series)
 *   profileImageId: number | null (FK to characterImages)
 *   loraUrl: string | null (CivitAI or direct .safetensors URL)
 *   loraTriggerWord: string | null (trigger word to activate LoRA)
 *   loraScale: number (LoRA strength 0.0-1.0, default 0.8)
 *   createdAt: Date
 *   updatedAt: Date
 * }
 *
 * CharacterImage schema:
 * {
 *   id: number (auto-increment)
 *   characterId: number (FK to characters)
 *   type: 'profile' | 'reference'
 *   blob: Blob (WebP image data)
 *   width: number
 *   height: number
 *   name: string
 *   createdAt: Date
 * }
 */

// Default project settings with nested element defaults
export const DEFAULT_PROJECT_SETTINGS = {
  // Page defaults
  width: 800,
  height: 1200,
  backgroundColor: '#ffffff',

  // Text element defaults
  text: {
    fontFamily: 'Comic Neue, cursive',
    fontSize: 24,
    fontWeight: 'normal',
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3,
    textAlign: 'center'
  },

  // Speech bubble defaults
  speechBubble: {
    fontFamily: 'Comic Neue, cursive',
    fontSize: 16,
    textColor: '#000000',
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 3,
    bubbleStyle: 'round'
  },

  // Text effect defaults
  textEffect: {
    text: 'EFFECT!',
    fontFamily: 'Bangers, cursive',
    fontSize: 64,
    letterSpacing: 2,
    fill: '#FFFF00',
    stroke: '#000000',
    strokeWidth: 3,
    outerStroke: '#FF0000',
    outerStrokeWidth: 4
  },

  // Image element defaults
  image: {
    opacity: 1,
    stroke: '#000000',
    strokeWidth: 0,
    cornerRadius: 0,
    cornerShape: 'round'
  },

  // Custom AI model settings
  customModel: {
    enabled: false,
    name: '',                // Display name (e.g., "Pony Diffusion V6")
    type: 'sdxl',            // 'flux' | 'sdxl' | 'sd15' | 'pony'
    url: ''                  // CivitAI download URL
  }
}

// Create a new blank page (inherits settings from project)
export function createBlankPage(pageNumber = 1, projectSettings = DEFAULT_PROJECT_SETTINGS) {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pageNumber,
    settings: { ...projectSettings },
    panels: [],
    elements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Project CRUD operations
export const projectsDb = {
  /**
   * Create a new project
   * @param {string} title - Project title
   * @param {object} settings - Project settings
   * @param {number} seriesId - Series ID (required)
   */
  async create(title, settings = {}, seriesId) {
    if (!seriesId) {
      throw new Error('seriesId is required when creating a project')
    }
    const now = new Date()
    const mergedSettings = { ...DEFAULT_PROJECT_SETTINGS, ...settings }
    const project = {
      title: title || 'Untitled Project',
      seriesId,
      createdAt: now,
      updatedAt: now,
      fileHandle: null,
      settings: mergedSettings,
      assets: {
        imageIds: []
      },
      pages: [createBlankPage(1, mergedSettings)],
    }

    const id = await db.projects.add(project)
    return { ...project, id }
  },

  /**
   * Get all projects (for listing)
   */
  async getAll() {
    return await db.projects.orderBy('updatedAt').reverse().toArray()
  },

  /**
   * Get all projects in a specific series
   */
  async getBySeriesId(seriesId) {
    return await db.projects.where('seriesId').equals(seriesId).reverse().sortBy('updatedAt')
  },

  /**
   * Get a single project by ID
   */
  async getById(id) {
    return await db.projects.get(id)
  },

  /**
   * Update a project
   */
  async update(id, updates) {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
    return await db.projects.get(id)
  },

  /**
   * Delete a project
   */
  async delete(id) {
    await db.projects.delete(id)
  },

  /**
   * Save project to file system (File System Access API)
   */
  async saveToFile(project, existingHandle = null) {
    // Check if File System Access API is supported
    if (!('showSaveFilePicker' in window)) {
      // Fallback: download as file
      return await this.downloadAsFile(project)
    }

    try {
      let handle = existingHandle

      if (!handle) {
        handle = await window.showSaveFilePicker({
          suggestedName: `${project.title}.cbproject`,
          types: [{
            description: 'Comic Book Project',
            accept: { 'application/json': ['.cbproject'] },
          }],
        })
      }

      const writable = await handle.createWritable()
      const data = JSON.stringify({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        project: {
          title: project.title,
          settings: project.settings,
          pages: project.pages,
        },
      }, null, 2)
      
      await writable.write(data)
      await writable.close()

      // Store the file handle for future saves
      await this.update(project.id, { fileHandle: handle })

      return { success: true, handle }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true }
      }
      throw error
    }
  },

  /**
   * Fallback: Download project as file (for Firefox)
   */
  async downloadAsFile(project) {
    const data = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project: {
        title: project.title,
        settings: project.settings,
        pages: project.pages,
      },
    }, null, 2)

    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title}.cbproject`
    a.click()
    
    URL.revokeObjectURL(url)
    return { success: true, downloaded: true }
  },

  /**
   * Open project from file system
   */
  async openFromFile() {
    if (!('showOpenFilePicker' in window)) {
      // Fallback: use file input
      return await this.openFromFileInput()
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Comic Book Project',
          accept: { 'application/json': ['.cbproject'] },
        }],
      })

      const file = await handle.getFile()
      const text = await file.text()
      const data = JSON.parse(text)

      // Import project into IndexedDB
      const project = await this.create(data.project.title, data.project.settings)
      await this.update(project.id, {
        pages: data.project.pages,
        fileHandle: handle,
      })

      return { success: true, project: await this.getById(project.id) }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true }
      }
      throw error
    }
  },

  /**
   * Fallback: Open project from file input (for Firefox)
   */
  openFromFileInput() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.cbproject,application/json'
      
      input.onchange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) {
          resolve({ success: false, cancelled: true })
          return
        }

        try {
          const text = await file.text()
          const data = JSON.parse(text)

          const project = await this.create(data.project.title, data.project.settings)
          await this.update(project.id, {
            pages: data.project.pages,
          })

          resolve({ success: true, project: await this.getById(project.id) })
        } catch (error) {
          resolve({ success: false, error })
        }
      }

      input.click()
    })
  },
}

export default db
