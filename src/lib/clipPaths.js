/**
 * CSS clip-path generators for corner shapes
 * Converts canvas drawing logic to CSS clip-path strings
 */

/**
 * Generate a CSS clip-path for a corner shape
 * @param {string} cornerShape - 'round', 'bevel', 'notch', 'scoop', 'squircle'
 * @param {number} radius - Corner radius in pixels
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {string} CSS clip-path value
 */
export function getCornerClipPath(cornerShape, radius, width, height) {
  const r = Math.min(radius || 0, width / 2, height / 2)

  if (r <= 0 || cornerShape === 'round' || !cornerShape) {
    // Use inset with border-radius for round corners
    return r > 0 ? `inset(0 round ${r}px)` : 'none'
  }

  switch (cornerShape) {
    case 'bevel':
      return getBevelClipPath(r, width, height)
    case 'notch':
      return getNotchClipPath(r, width, height)
    case 'scoop':
      // Scoop requires SVG for inward curves - return a marker
      return `url(#scoop-clip)`
    case 'squircle':
      return getSquircleClipPath(r, width, height)
    default:
      return r > 0 ? `inset(0 round ${r}px)` : 'none'
  }
}

/**
 * Bevel: Cut corners at 45 degrees
 */
function getBevelClipPath(r, width, height) {
  return `polygon(
    ${r}px 0,
    ${width - r}px 0,
    ${width}px ${r}px,
    ${width}px ${height - r}px,
    ${width - r}px ${height}px,
    ${r}px ${height}px,
    0 ${height - r}px,
    0 ${r}px
  )`
}

/**
 * Notch: Square notches cut into corners
 */
function getNotchClipPath(r, width, height) {
  return `polygon(
    ${r}px 0,
    ${width - r}px 0,
    ${width - r}px ${r}px,
    ${width}px ${r}px,
    ${width}px ${height - r}px,
    ${width - r}px ${height - r}px,
    ${width - r}px ${height}px,
    ${r}px ${height}px,
    ${r}px ${height - r}px,
    0 ${height - r}px,
    0 ${r}px,
    ${r}px ${r}px
  )`
}

/**
 * Squircle: Superellipse approximation using inset with different radii
 * This is an approximation - true squircle would need SVG path
 */
function getSquircleClipPath(r, width, height) {
  // Use a larger visual radius for squircle effect
  const visualR = r * 1.2
  return `inset(0 round ${visualR}px)`
}

/**
 * Generate SVG path for scoop corners (inward curves)
 * This needs to be used with an SVG clipPath element
 * @param {number} r - Corner radius
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {string} SVG path d attribute
 */
export function getScoopSvgPath(r, width, height) {
  const clampedR = Math.min(r, width / 2, height / 2)

  if (clampedR <= 0) {
    return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`
  }

  // Scoop uses arcs that curve inward (into the corners)
  return `
    M ${clampedR} 0
    L ${width - clampedR} 0
    A ${clampedR} ${clampedR} 0 0 0 ${width} ${clampedR}
    L ${width} ${height - clampedR}
    A ${clampedR} ${clampedR} 0 0 0 ${width - clampedR} ${height}
    L ${clampedR} ${height}
    A ${clampedR} ${clampedR} 0 0 0 0 ${height - clampedR}
    L 0 ${clampedR}
    A ${clampedR} ${clampedR} 0 0 0 ${clampedR} 0
    Z
  `.replace(/\s+/g, ' ').trim()
}
