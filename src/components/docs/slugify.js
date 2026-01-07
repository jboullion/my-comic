/**
 * Slugify text for anchor IDs
 */
export function slugify(text) {
  if (!text) return ''
  const str = typeof text === 'string' ? text : String(text)
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
