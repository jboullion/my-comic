import React, { useRef, useEffect, useState, useCallback } from 'react'

/**
 * HTML Speech Bubble Component
 *
 * Structure:
 * 1. Wrapper div - handles positioning, transforms, and interaction handles (drag, resize, rotate)
 * 2. SVG element - renders the bubble shape (100% of wrapper size)
 * 3. Text div - contenteditable for inline text editing
 */
export default function HtmlSpeechBubble({ element, onSelect, onChange, isSelected, zoom = 1 }) {
  const wrapperRef = useRef(null)
  const textRef = useRef(null)

  // Interaction state
  const [isEditing, setIsEditing] = useState(false)
  const [interactionMode, setInteractionMode] = useState(null) // 'drag' | 'resize' | 'rotate' | null

  // Local transform state for smooth visual updates during interaction
  // These are only used while dragging/resizing/rotating - otherwise we use element props
  const [localTransform, setLocalTransform] = useState(null)

  // Refs for tracking interaction state
  const interactionRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startRotation: 0,
    startElemX: 0,
    startElemY: 0,
    resizeHandle: null, // 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
    centerX: 0,
    centerY: 0,
  })

  // Calculate center point in screen coordinates
  const getElementCenter = useCallback(() => {
    if (!wrapperRef.current) return { x: 0, y: 0 }
    const rect = wrapperRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    if (isEditing) return
    e.preventDefault()
    e.stopPropagation()

    setInteractionMode('drag')
    interactionRef.current = {
      ...interactionRef.current,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: element.x,
      startElemY: element.y,
    }

    onSelect()
  }, [isEditing, element.x, element.y, onSelect])

  // Handle resize start
  const handleResizeStart = useCallback((e, handle) => {
    e.preventDefault()
    e.stopPropagation()

    setInteractionMode('resize')
    const center = getElementCenter()
    interactionRef.current = {
      ...interactionRef.current,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElemX: element.x,
      startElemY: element.y,
      resizeHandle: handle,
      centerX: center.x,
      centerY: center.y,
      startRotation: element.rotation || 0,
    }
  }, [element.width, element.height, element.x, element.y, element.rotation, getElementCenter])

  // Handle rotate start
  const handleRotateStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    setInteractionMode('rotate')
    const center = getElementCenter()
    interactionRef.current = {
      ...interactionRef.current,
      startX: e.clientX,
      startY: e.clientY,
      startRotation: element.rotation || 0,
      centerX: center.x,
      centerY: center.y,
    }
  }, [element.rotation, getElementCenter])

  // Calculate new transform values based on mouse position
  const calculateTransform = useCallback((e) => {
    const { startX, startY, startWidth, startHeight, startElemX, startElemY, resizeHandle, centerX, centerY, startRotation } = interactionRef.current

    if (interactionMode === 'drag') {
      const dx = (e.clientX - startX) / zoom
      const dy = (e.clientY - startY) / zoom

      return {
        x: startElemX + dx,
        y: startElemY + dy,
      }
    } else if (interactionMode === 'resize') {
      // Calculate mouse delta in rotated coordinate space
      const rotation = (startRotation || 0) * Math.PI / 180
      const dx = (e.clientX - startX) / zoom
      const dy = (e.clientY - startY) / zoom

      // Rotate delta to local coordinates
      const cos = Math.cos(-rotation)
      const sin = Math.sin(-rotation)
      const localDx = dx * cos - dy * sin
      const localDy = dx * sin + dy * cos

      let newWidth = startWidth
      let newHeight = startHeight
      let offsetX = 0
      let offsetY = 0

      // Apply resize based on handle
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(50, startWidth + localDx)
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(50, startWidth - localDx)
        offsetX = (startWidth - newWidth) / 2
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(30, startHeight + localDy)
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(30, startHeight - localDy)
        offsetY = (startHeight - newHeight) / 2
      }

      // Calculate position offset in world coordinates
      const worldOffsetX = offsetX * Math.cos(rotation) - offsetY * Math.sin(rotation)
      const worldOffsetY = offsetX * Math.sin(rotation) + offsetY * Math.cos(rotation)

      return {
        width: newWidth,
        height: newHeight,
        x: startElemX - worldOffsetX,
        y: startElemY - worldOffsetY,
      }
    } else if (interactionMode === 'rotate') {
      // Calculate angle from center to mouse
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const startAngle = Math.atan2(startY - centerY, startX - centerX)
      const deltaAngle = (currentAngle - startAngle) * 180 / Math.PI

      let newRotation = startRotation + deltaAngle

      // Snap to 15 degree increments when holding shift
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15
      }

      return { rotation: newRotation }
    }

    return null
  }, [interactionMode, zoom])

  // Handle mouse move - update local state only for smooth visuals
  const handleMouseMove = useCallback((e) => {
    if (!interactionMode) return

    const newTransform = calculateTransform(e)
    if (newTransform) {
      setLocalTransform(newTransform)
    }
  }, [interactionMode, calculateTransform])

  // Handle mouse up - persist to store and clear local state
  const handleMouseUp = useCallback(() => {
    if (localTransform) {
      onChange(localTransform)
      setLocalTransform(null)
    }
    setInteractionMode(null)
  }, [localTransform, onChange])

  // Set up global mouse listeners
  useEffect(() => {
    if (interactionMode) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [interactionMode, handleMouseMove, handleMouseUp])

  // Handle wrapper click for selection
  const handleWrapperClick = () => {
    if (!isEditing) {
      onSelect()
    }
  }

  // Handle double-click to edit text
  const handleTextDoubleClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
    onSelect()

    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus()
        const range = document.createRange()
        range.selectNodeContents(textRef.current)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }, 0)
  }

  // Handle text blur - save changes
  const handleTextBlur = (e) => {
    setIsEditing(false)
    const newText = e.currentTarget.textContent || ''
    if (newText !== element.text) {
      onChange({ text: newText })
    }
  }

  // Use local transform during interaction, otherwise use element props
  const currentX = localTransform?.x ?? element.x
  const currentY = localTransform?.y ?? element.y
  const currentWidth = localTransform?.width ?? element.width
  const currentHeight = localTransform?.height ?? element.height
  const currentRotation = localTransform?.rotation ?? element.rotation ?? 0

  // Render SVG bubble shape
  const renderBubbleSvg = () => {
    const { bubbleStyle, cornerRadius = 20, fill = '#FFFFFF', stroke = '#000000', strokeWidth = 2 } = element
    const width = currentWidth
    const height = currentHeight

    if (bubbleStyle === 'cloud') {
      // Cloud bubble - circle-based fluffy shape
      const numBumps = 12
      const radiusX = width / 2
      const radiusY = height / 2
      const centerX = width / 2
      const centerY = height / 2
      const bumpRadius = Math.min(width, height) * 0.1

      let path = ''
      for (let i = 0; i <= numBumps; i++) {
        const angle = (i / numBumps) * Math.PI * 2
        const x = centerX + Math.cos(angle) * radiusX
        const y = centerY + Math.sin(angle) * radiusY

        if (i === 0) {
          path += `M ${x} ${y}`
        }

        const nextAngle = ((i + 1) / numBumps) * Math.PI * 2
        const nextX = centerX + Math.cos(nextAngle) * radiusX
        const nextY = centerY + Math.sin(nextAngle) * radiusY
        const controlAngle = angle + (nextAngle - angle) / 2
        const controlX = centerX + Math.cos(controlAngle) * (radiusX + bumpRadius)
        const controlY = centerY + Math.sin(controlAngle) * (radiusY + bumpRadius)

        path += ` Q ${controlX} ${controlY}, ${nextX} ${nextY}`
      }
      path += ' Z'

      return (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
    } else {
      // Round bubble - rounded rectangle
      return (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={width - strokeWidth}
            height={height - strokeWidth}
            rx={cornerRadius}
            ry={cornerRadius}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </svg>
      )
    }
  }

  // Resize handle positions
  const resizeHandles = [
    { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
    { id: 'n', x: '50%', y: 0, cursor: 'ns-resize' },
    { id: 'ne', x: '100%', y: 0, cursor: 'nesw-resize' },
    { id: 'e', x: '100%', y: '50%', cursor: 'ew-resize' },
    { id: 'se', x: '100%', y: '100%', cursor: 'nwse-resize' },
    { id: 's', x: '50%', y: '100%', cursor: 'ns-resize' },
    { id: 'sw', x: 0, y: '100%', cursor: 'nesw-resize' },
    { id: 'w', x: 0, y: '50%', cursor: 'ew-resize' },
  ]

  // Styles
  const wrapperStyle = {
    position: 'absolute',
    left: `${currentX - currentWidth / 2}px`,
    top: `${currentY - currentHeight / 2}px`,
    width: `${currentWidth}px`,
    height: `${currentHeight}px`,
    transform: `rotate(${currentRotation}deg)`,
    transformOrigin: 'center center',
    opacity: element.opacity || 1,
    cursor: isEditing ? 'text' : (interactionMode === 'drag' ? 'grabbing' : 'grab'),
    userSelect: 'none',
    zIndex: element.zIndex || 1,
    pointerEvents: 'auto',
  }

  const handleSize = 10
  const handleStyle = {
    position: 'absolute',
    width: `${handleSize}px`,
    height: `${handleSize}px`,
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

  const textStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: `${element.padding || 10}px`,
    fontSize: `${element.fontSize || 16}px`,
    fontFamily: element.fontFamily || 'Arial, sans-serif',
    color: element.textColor || '#000000',
    textAlign: element.textAlign || 'center',
    display: 'flex',
    alignItems: element.verticalAlign === 'top' ? 'flex-start' : element.verticalAlign === 'bottom' ? 'flex-end' : 'center',
    justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
    outline: 'none',
    cursor: isEditing ? 'text' : 'inherit',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    pointerEvents: 'auto',
    userSelect: isEditing ? 'text' : 'none',
    boxSizing: 'border-box',
  }

  const selectionBorderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '2px solid #6366f1',
    pointerEvents: 'none',
    zIndex: 5,
  }

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onClick={handleWrapperClick}
      onMouseDown={handleDragStart}
    >
      {/* Selection border */}
      {isSelected && <div style={selectionBorderStyle} />}

      {/* SVG Bubble Shape */}
      {renderBubbleSvg()}

      {/* Text Layer */}
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleTextDoubleClick}
        onClick={(e) => e.stopPropagation()}
        onBlur={handleTextBlur}
        onMouseDown={(e) => {
          if (isEditing) {
            e.stopPropagation()
          }
        }}
        spellCheck={false}
        style={textStyle}
      >
        {element.text || 'Double-click to edit'}
      </div>

      {/* Interaction Handles - only show when selected and not editing */}
      {isSelected && !isEditing && (
        <>
          {/* Rotate handle */}
          <div style={rotateLineStyle} />
          <div
            style={rotateHandleStyle}
            onMouseDown={handleRotateStart}
            title="Drag to rotate"
          />

          {/* Resize handles */}
          {resizeHandles.map((handle) => (
            <div
              key={handle.id}
              style={{
                ...handleStyle,
                left: handle.x,
                top: handle.y,
                cursor: handle.cursor,
              }}
              onMouseDown={(e) => handleResizeStart(e, handle.id)}
            />
          ))}
        </>
      )}
    </div>
  )
}
