import JSZip from 'jszip'

/**
 * Export utilities for Comic Book Maker
 */

/**
 * Convert a data URL to a Blob
 * @param {string} dataUrl - The data URL to convert
 * @returns {Blob} The blob
 */
export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

/**
 * Export all pages to a zip file
 * @param {Array} pages - Array of { index, dataUrl } objects
 * @param {string} projectTitle - Project title for the zip filename
 * @param {string} format - Image format ('webp' or 'png')
 * @returns {Promise<void>}
 */
export async function exportPagesToZip(pages, projectTitle, format = 'webp') {
  const zip = new JSZip()
  const extension = format === 'png' ? 'png' : 'webp'

  // Add each page to the zip
  for (const page of pages) {
    const pageNumber = String(page.index + 1).padStart(3, '0')
    const filename = `page-${pageNumber}.${extension}`
    const blob = dataUrlToBlob(page.dataUrl)
    zip.file(filename, blob)
  }

  // Generate the zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  // Trigger download
  const sanitizedTitle = projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  downloadBlob(zipBlob, `${sanitizedTitle}-export.zip`)
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
