/**
 * GridOverlay Component
 *
 * Visual grid lines overlay on the canvas page.
 * Uses CSS background pattern for efficient rendering.
 */
export default function GridOverlay({ gridSize }) {
  const gridStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundPosition: '0 0',
    zIndex: 1
  }

  return <div style={gridStyle} className="selection-ui" />
}
