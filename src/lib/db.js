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

/**
 * Project schema:
 * {
 *   id: number (auto-increment)
 *   title: string
 *   createdAt: Date
 *   updatedAt: Date
 *   fileHandle: FileSystemFileHandle | null (for File System Access API)
 *   settings: {
 *     width: number (default 800)
 *     height: number (default 1200)
 *     backgroundColor: string
 *   }
 *   assets: {
 *     imageIds: string[]
 *   }
 *   pages: Page[]
 * }
 * 
 * Page schema:
 * {
 *   id: string
 *   pageNumber: number
 *   backgroundColor: string | null
 *   panels: Panel[]
 *   elements: Element[]
 *   createdAt: Date
 *   updatedAt: Date
 * }
 */

// Default project settings
export const DEFAULT_PROJECT_SETTINGS = {
  width: 800,
  height: 1200,
  backgroundColor: '#ffffff',
}

// Create a new blank page
export function createBlankPage(pageNumber = 1) {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pageNumber,
    backgroundColor: null,
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
   */
  async create(title, settings = {}) {
    const now = new Date()
    const project = {
      title: title || 'Untitled Project',
      createdAt: now,
      updatedAt: now,
      fileHandle: null,
      settings: { ...DEFAULT_PROJECT_SETTINGS, ...settings },
      assets: {
        imageIds: []
      },
      pages: [createBlankPage(1)],
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
