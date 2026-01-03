/**
 * Canvas shape utilities for drawing custom corner shapes
 */

/**
 * Draw a path with custom corner shapes (CSS corner-shape property)
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {number} width - Shape width
 * @param {number} height - Shape height
 * @param {number} radius - Corner radius
 * @param {string} cornerShape - Corner shape type: 'round', 'bevel', 'notch', 'scoop', 'squircle'
 */
export function drawCornerShapePath(ctx, width, height, radius, cornerShape) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  
  if (cornerShape === 'round' || !cornerShape || r <= 0) {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.arcTo(width, 0, width, r, r)
    ctx.lineTo(width, height - r)
    ctx.arcTo(width, height, width - r, height, r)
    ctx.lineTo(r, height)
    ctx.arcTo(0, height, 0, height - r, r)
    ctx.lineTo(0, r)
    ctx.arcTo(0, 0, r, 0, r)
  } else if (cornerShape === 'bevel') {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.lineTo(width, r)
    ctx.lineTo(width, height - r)
    ctx.lineTo(width - r, height)
    ctx.lineTo(r, height)
    ctx.lineTo(0, height - r)
    ctx.lineTo(0, r)
  } else if (cornerShape === 'notch') {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.lineTo(width - r, r)
    ctx.lineTo(width, r)
    ctx.lineTo(width, height - r)
    ctx.lineTo(width - r, height - r)
    ctx.lineTo(width - r, height)
    ctx.lineTo(r, height)
    ctx.lineTo(r, height - r)
    ctx.lineTo(0, height - r)
    ctx.lineTo(0, r)
    ctx.lineTo(r, r)
  } else if (cornerShape === 'scoop') {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.arc(width, 0, r, Math.PI, Math.PI / 2, true)
    ctx.lineTo(width, height - r)
    ctx.arc(width, height, r, -Math.PI / 2, Math.PI, true)
    ctx.lineTo(r, height)
    ctx.arc(0, height, r, 0, -Math.PI / 2, true)
    ctx.lineTo(0, r)
    ctx.arc(0, 0, r, Math.PI / 2, 0, true)
  } else if (cornerShape === 'squircle') {
    // Approximation of a squircle (superellipse n=4)
    const cp = r * 0.8 
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.bezierCurveTo(width - (r - cp), 0, width, r - cp, width, r)
    ctx.lineTo(width, height - r)
    ctx.bezierCurveTo(width, height - (r - cp), width - (r - cp), height, width - r, height)
    ctx.lineTo(r, height)
    ctx.bezierCurveTo(r - cp, height, 0, height - (r - cp), 0, height - r)
    ctx.lineTo(0, r)
    ctx.bezierCurveTo(0, r - cp, r - cp, 0, r, 0)
  }
  ctx.closePath()
}
