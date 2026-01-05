import JSZip from 'jszip'
import { db } from './db'
import { downloadBlob } from './export'

/**
 * Project File Utilities for .mycomic format
 *
 * .mycomic is a zip file containing:
 * - manifest.json: Version and metadata
 * - project.json: Project data (title, settings, pages)
 * - images/: Directory of image assets as WebP files
 */

const FORMAT_VERSION = '1.0'

/**
 * Save project to .mycomic file
 * @param {Object} project - The project object from the store
 * @returns {Promise<void>}
 */
export async function saveProjectToFile(project) {
  const zip = new JSZip()

  // 1. Create manifest
  const manifest = {
    version: FORMAT_VERSION,
    format: 'mycomic',
    createdAt: new Date().toISOString(),
    app: 'Comic Book Maker'
  }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  // 2. Get all images for this project
  const images = await db.images.where({ projectId: project.id }).toArray()

  // 3. Create image ID mapping (DB id -> hash for file reference)
  const imageMap = {}
  const imagesFolder = zip.folder('images')

  for (const image of images) {
    // Store image by hash
    const filename = `${image.hash}.webp`
    imagesFolder.file(filename, image.blob)

    // Map DB id to hash
    imageMap[image.id] = {
      hash: image.hash,
      name: image.name,
      width: image.width,
      height: image.height
    }
  }

  // 4. Create project data with image references updated
  const projectData = {
    title: project.title,
    settings: project.settings,
    assets: {
      imageIds: project.assets?.imageIds || [],
      imageMap // Include mapping for import
    },
    pages: project.pages
  }
  zip.file('project.json', JSON.stringify(projectData, null, 2))

  // 5. Generate zip and trigger download
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const sanitizedTitle = project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  // Use File System Access API if available
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${sanitizedTitle}.mycomic`,
        types: [{
          description: 'Comic Book Project',
          accept: { 'application/zip': ['.mycomic'] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(zipBlob)
      await writable.close()
      return { success: true, handle }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true }
      }
      throw error
    }
  } else {
    // Fallback for browsers without File System Access API
    downloadBlob(zipBlob, `${sanitizedTitle}.mycomic`)
    return { success: true, downloaded: true }
  }
}

/**
 * Load project from .mycomic file
 * @returns {Promise<{success: boolean, project?: Object, cancelled?: boolean, error?: Error}>}
 */
export async function loadProjectFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.mycomic'

    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) {
        resolve({ success: false, cancelled: true })
        return
      }

      try {
        const result = await parseMyComicFile(file)
        resolve(result)
      } catch (error) {
        console.error('Failed to load .mycomic file:', error)
        resolve({ success: false, error })
      }
    }

    input.oncancel = () => {
      resolve({ success: false, cancelled: true })
    }

    input.click()
  })
}

/**
 * Parse a .mycomic file and import into IndexedDB
 * @param {File} file - The .mycomic file
 * @returns {Promise<{success: boolean, project: Object}>}
 */
async function parseMyComicFile(file) {
  const zip = await JSZip.loadAsync(file)

  // 1. Read and validate manifest
  const manifestFile = zip.file('manifest.json')
  if (!manifestFile) {
    throw new Error('Invalid .mycomic file: missing manifest.json')
  }
  const manifest = JSON.parse(await manifestFile.async('text'))

  if (manifest.format !== 'mycomic') {
    throw new Error('Invalid .mycomic file: wrong format')
  }

  // 2. Read project data
  const projectFile = zip.file('project.json')
  if (!projectFile) {
    throw new Error('Invalid .mycomic file: missing project.json')
  }
  const projectData = JSON.parse(await projectFile.async('text'))

  // 3. Create new project in DB
  const now = new Date()
  const newProject = {
    title: projectData.title,
    createdAt: now,
    updatedAt: now,
    fileHandle: null,
    settings: projectData.settings,
    assets: {
      imageIds: []
    },
    pages: projectData.pages
  }
  const projectId = await db.projects.add(newProject)

  // 4. Import images
  const imagesFolder = zip.folder('images')
  const imageMap = projectData.assets?.imageMap || {}
  const oldToNewIdMap = {} // Map old IDs to new IDs

  if (imagesFolder) {
    for (const [oldId, imageInfo] of Object.entries(imageMap)) {
      const filename = `${imageInfo.hash}.webp`
      const imageFile = imagesFolder.file(filename)

      if (imageFile) {
        const blob = await imageFile.async('blob')

        // Check if image with same hash already exists for this project
        const existing = await db.images
          .where({ projectId, hash: imageInfo.hash })
          .first()

        let newId
        if (existing) {
          newId = existing.id
        } else {
          // Add new image
          newId = await db.images.add({
            projectId,
            hash: imageInfo.hash,
            name: imageInfo.name,
            size: blob.size,
            type: 'image/webp',
            blob,
            width: imageInfo.width,
            height: imageInfo.height,
            createdAt: now
          })
        }

        oldToNewIdMap[oldId] = newId
      }
    }
  }

  // 5. Update project with new image IDs
  const newImageIds = (projectData.assets?.imageIds || [])
    .map(oldId => oldToNewIdMap[oldId])
    .filter(id => id !== undefined)

  // Update element image references in pages
  const updatedPages = projectData.pages.map(page => ({
    ...page,
    elements: page.elements?.map(el => {
      if (el.type === 'image' && el.imageId) {
        return {
          ...el,
          imageId: oldToNewIdMap[el.imageId] || el.imageId
        }
      }
      return el
    }) || []
  }))

  await db.projects.update(projectId, {
    assets: { imageIds: newImageIds },
    pages: updatedPages
  })

  const finalProject = await db.projects.get(projectId)
  return { success: true, project: finalProject }
}
