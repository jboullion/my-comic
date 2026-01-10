import JSZip from 'jszip'
import { db } from './db'
import { downloadBlob } from './export'
import { seriesDb } from './series'
import { charactersDb } from './characters'

/**
 * Series File Utilities for .myseries format
 *
 * .myseries is a zip file containing:
 * - manifest.json: Version and metadata
 * - series.json: Series data (name, description)
 * - cover.webp: Optional series cover image
 * - characters/: Directory of character data and images
 *   - character-{id}.json: Character metadata
 *   - images/: Character images (profile and reference)
 */

const FORMAT_VERSION = '1.0'

/**
 * Export a series to .myseries file
 * @param {number} seriesId - The series ID to export
 * @returns {Promise<{success: boolean, cancelled?: boolean}>}
 */
export async function exportSeriesToFile(seriesId) {
  const zip = new JSZip()

  // 1. Get series with cover image
  const series = await seriesDb.getByIdWithCountsAndImage(seriesId)
  if (!series) {
    throw new Error('Series not found')
  }

  // 2. Create manifest
  const manifest = {
    version: FORMAT_VERSION,
    format: 'myseries',
    createdAt: new Date().toISOString(),
    app: 'Comic Book Maker'
  }
  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  // 3. Create series data
  const seriesData = {
    name: series.name,
    description: series.description || '',
    hasCoverImage: !!series.coverImage
  }
  zip.file('series.json', JSON.stringify(seriesData, null, 2))

  // 4. Add cover image if exists
  if (series.coverImage?.blob) {
    zip.file('cover.webp', series.coverImage.blob)
  }

  // 5. Get all characters in this series with their images
  const characters = await charactersDb.getAllWithProfileImagesBySeries(seriesId)
  const charactersFolder = zip.folder('characters')
  const imagesFolder = charactersFolder.folder('images')

  for (const character of characters) {
    // Get all images for this character
    const characterImages = await charactersDb.getImages(character.id)

    // Create character data (including LoRA fields)
    const characterData = {
      name: character.name,
      description: character.description || '',
      loraUrl: character.loraUrl || null,
      loraTriggerWord: character.loraTriggerWord || null,
      loraScale: character.loraScale ?? 0.8,
      images: characterImages.map((img, index) => ({
        type: img.type,
        filename: `char-${character.id}-${index}.webp`,
        width: img.width,
        height: img.height,
        isProfile: img.id === character.profileImageId
      }))
    }
    charactersFolder.file(`character-${character.id}.json`, JSON.stringify(characterData, null, 2))

    // Add character images
    for (let i = 0; i < characterImages.length; i++) {
      const img = characterImages[i]
      if (img.blob) {
        imagesFolder.file(`char-${character.id}-${i}.webp`, img.blob)
      }
    }
  }

  // 6. Generate zip and trigger download
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const sanitizedName = series.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()

  // Use File System Access API if available
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${sanitizedName}.myseries`,
        types: [{
          description: 'Comic Book Series',
          accept: { 'application/zip': ['.myseries'] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(zipBlob)
      await writable.close()
      return { success: true }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true }
      }
      throw error
    }
  } else {
    // Fallback for browsers without File System Access API
    downloadBlob(zipBlob, `${sanitizedName}.myseries`)
    return { success: true }
  }
}

/**
 * Import a series from .myseries file
 * @returns {Promise<{success: boolean, series?: Object, cancelled?: boolean, error?: Error}>}
 */
export async function importSeriesFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.myseries'

    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) {
        resolve({ success: false, cancelled: true })
        return
      }

      try {
        const result = await parseMySeriesFile(file)
        resolve(result)
      } catch (error) {
        console.error('Failed to load .myseries file:', error)
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
 * Parse a .myseries file and import into IndexedDB
 * @param {File} file - The .myseries file
 * @returns {Promise<{success: boolean, series: Object}>}
 */
async function parseMySeriesFile(file) {
  const zip = await JSZip.loadAsync(file)

  // 1. Read and validate manifest
  const manifestFile = zip.file('manifest.json')
  if (!manifestFile) {
    throw new Error('Invalid .myseries file: missing manifest.json')
  }
  const manifest = JSON.parse(await manifestFile.async('text'))

  if (manifest.format !== 'myseries') {
    throw new Error('Invalid .myseries file: wrong format')
  }

  // 2. Read series data
  const seriesFile = zip.file('series.json')
  if (!seriesFile) {
    throw new Error('Invalid .myseries file: missing series.json')
  }
  const seriesData = JSON.parse(await seriesFile.async('text'))

  // 3. Check if series with same name exists
  const existingSeries = await seriesDb.findByName(seriesData.name)
  let newSeriesName = seriesData.name

  if (existingSeries) {
    // Append "(imported)" to avoid conflicts
    newSeriesName = `${seriesData.name} (imported)`
    // Check again and add number if needed
    let counter = 1
    while (await seriesDb.findByName(newSeriesName)) {
      counter++
      newSeriesName = `${seriesData.name} (imported ${counter})`
    }
  }

  // 4. Create new series
  const newSeries = await seriesDb.create(newSeriesName, seriesData.description)

  // 5. Import cover image if exists
  const coverFile = zip.file('cover.webp')
  if (coverFile) {
    const coverBlob = await coverFile.async('blob')
    // Convert blob to File for the setCoverImage function
    const coverImageFile = new File([coverBlob], 'cover.webp', { type: 'image/webp' })
    await seriesDb.setCoverImage(newSeries.id, coverImageFile)
  }

  // 6. Import characters
  const charactersFolder = zip.folder('characters')
  if (charactersFolder) {
    // Find all character JSON files
    const characterFiles = []
    charactersFolder.forEach((relativePath, file) => {
      if (relativePath.match(/^character-\d+\.json$/)) {
        characterFiles.push(file)
      }
    })

    for (const charFile of characterFiles) {
      const characterData = JSON.parse(await charFile.async('text'))

      // Prepare LoRA data if present
      const loraData = characterData.loraUrl ? {
        loraUrl: characterData.loraUrl,
        loraTriggerWord: characterData.loraTriggerWord || null,
        loraScale: characterData.loraScale ?? 0.8
      } : {}

      // Create character with LoRA data
      const newCharacter = await charactersDb.create(
        characterData.name,
        characterData.description,
        newSeries.id,
        loraData
      )

      // Import character images
      if (characterData.images && characterData.images.length > 0) {
        for (const imgInfo of characterData.images) {
          const imgFile = zip.file(`characters/images/${imgInfo.filename}`)
          if (imgFile) {
            const imgBlob = await imgFile.async('blob')
            const imageFile = new File([imgBlob], imgInfo.filename, { type: 'image/webp' })

            // Add image with correct type
            const addedImage = await charactersDb.addImage(
              newCharacter.id,
              imageFile,
              imgInfo.isProfile ? 'profile' : 'reference'
            )

            // Set as profile image if it was the profile
            if (imgInfo.isProfile) {
              await charactersDb.setProfileImage(newCharacter.id, addedImage.id)
            }
          }
        }
      }
    }
  }

  // 7. Return the new series with counts
  const finalSeries = await seriesDb.getByIdWithCountsAndImage(newSeries.id)
  return { success: true, series: finalSeries }
}
