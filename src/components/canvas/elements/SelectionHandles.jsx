import React from 'react'

const HANDLE_SIZE = 10

const RESIZE_HANDLES = [
  { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
  { id: 'n', x: '50%', y: 0, cursor: 'ns-resize' },
  { id: 'ne', x: '100%', y: 0, cursor: 'nesw-resize' },
  { id: 'e', x: '100%', y: '50%', cursor: 'ew-resize' },
  { id: 'se', x: '100%', y: '100%', cursor: 'nwse-resize' },
  { id: 's', x: '50%', y: '100%', cursor: 'ns-resize' },
  { id: 'sw', x: 0, y: '100%', cursor: 'nesw-resize' },
  { id: 'w', x: 0, y: '50%', cursor: 'ew-resize' },
]

const handleStyle = {
  position: 'absolute',
  width: `${HANDLE_SIZE}px`,
  height: `${HANDLE_SIZE}px`,
  backgroundColor: '#ffffff',
  border: '2px solid #6366f1',
  borderRadius: '2px',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
}

const rotateHandleStyle = {
  position: 'absolute',
  left: '50%',
  top: '-30px',
  width: '12px',
  height: '12px',
  backgroundColor: '#ffffff',
  border: '2px solid #6366f1',
  borderRadius: '50%',
  transform: 'translateX(-50%)',
  cursor: 'grab',
  zIndex: 10,
}

const rotateLineStyle = {
  position: 'absolute',
  left: '50%',
  top: '-18px',
  width: '2px',
  height: '18px',
  backgroundColor: '#6366f1',
  transform: 'translateX(-50%)',
  zIndex: 9,
}

export const selectionBorderStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: '2px solid #6366f1',
  pointerEvents: 'none',
  zIndex: 5,
}

// Secondary selection border style (dashed, for multi-select non-primary elements)
export const secondarySelectionBorderStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: '2px dashed #818cf8',
  pointerEvents: 'none',
  zIndex: 5,
}

/**
 * Selection handles component for resize and rotate interactions
 * @param {boolean} isPrimary - If true (default), shows resize/rotate handles. If false, shows only dashed border.
 * @param {boolean} hideResizeHandles - If true, hides resize handles but keeps rotate handle
 */
export default function SelectionHandles({ onResizeStart, onRotateStart, hideResizeHandles = false, isPrimary = true }) {
  // Secondary selection shows no handles, just the selection border is shown by parent
  if (!isPrimary) {
    return null
  }

  return (
    <div className="selection-ui">
      {/* Rotate handle */}
      <div style={rotateLineStyle} />
      <div
        style={rotateHandleStyle}
        onMouseDown={onRotateStart}
        title="Drag to rotate"
      />

      {/* Resize handles */}
      {!hideResizeHandles && RESIZE_HANDLES.map((handle) => (
        <div
          key={handle.id}
          style={{
            ...handleStyle,
            left: handle.x,
            top: handle.y,
            cursor: handle.cursor,
          }}
          onMouseDown={(e) => onResizeStart(e, handle.id)}
        />
      ))}
    </div>
  )
}
