import React, { useRef, useEffect, useState, useCallback } from 'react'
import useProjectStore from '../../../stores/useProjectStore'
import { useImageUrl } from '../../../hooks/useImage'
import { getCornerClipPath, getScoopSvgPath } from '../../../lib/clipPaths'

/**
 * HTML Image Element Component
 *
 * Renders images with CSS transforms and clip-paths.
 * Supports drag, resize, rotate with the same patterns as HtmlSpeechBubble.
 */
export default function HtmlImageElement({ element, onSelect, onChange, onContextMenu, isSelected, zoom = 1 }) {
  const { snapToGrid, snapGridSize } = useProjectStore()
  const imageUrl = useImageUrl(element.assetId)

  const wrapperRef = useRef(null)

  // Interaction state
  const [interactionMode, setInteractionMode] = useState(null) // 'drag' | 'resize' | 'rotate' | null
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
    resizeHandle: null,
    centerX: 0,
    centerY: 0,
  })

  // Snap value to grid if snapping is enabled
  const snapValue = useCallback((value) => {
    if (!snapToGrid) return value
    return Math.round(value / snapGridSize) * snapGridSize
  }, [snapToGrid, snapGridSize])

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
    if (e.target !== wrapperRef.current && e.target.tagName !== 'IMG') return
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
  }, [element.x, element.y, onSelect])

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
        x: snapValue(startElemX + dx),
        y: snapValue(startElemY + dy),
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
      let localOffsetX = 0
      let localOffsetY = 0

      // Apply resize based on handle
      if (resizeHandle.includes('e')) {
        const widthDelta = localDx
        newWidth = Math.max(50, startWidth + widthDelta)
        const actualDelta = newWidth - startWidth
        localOffsetX += actualDelta / 2
      }
      if (resizeHandle.includes('w')) {
        const widthDelta = -localDx
        newWidth = Math.max(50, startWidth + widthDelta)
        const actualDelta = newWidth - startWidth
        localOffsetX -= actualDelta / 2
      }
      if (resizeHandle.includes('s')) {
        const heightDelta = localDy
        newHeight = Math.max(50, startHeight + heightDelta)
        const actualDelta = newHeight - startHeight
        localOffsetY += actualDelta / 2
      }
      if (resizeHandle.includes('n')) {
        const heightDelta = -localDy
        newHeight = Math.max(50, startHeight + heightDelta)
        const actualDelta = newHeight - startHeight
        localOffsetY -= actualDelta / 2
      }

      // Transform local offset back to world coordinates
      const worldOffsetX = localOffsetX * Math.cos(rotation) - localOffsetY * Math.sin(rotation)
      const worldOffsetY = localOffsetX * Math.sin(rotation) + localOffsetY * Math.cos(rotation)

      return {
        width: newWidth,
        height: newHeight,
        x: startElemX + worldOffsetX,
        y: startElemY + worldOffsetY,
      }
    } else if (interactionMode === 'rotate') {
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
  }, [interactionMode, zoom, snapValue])

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
  const handleWrapperClick = (e) => {
    e.stopPropagation()
    onSelect()
  }

  // Use local transform during interaction, otherwise use element props
  const currentX = localTransform?.x ?? element.x
  const currentY = localTransform?.y ?? element.y
  const currentWidth = localTransform?.width ?? element.width
  const currentHeight = localTransform?.height ?? element.height
  const currentRotation = localTransform?.rotation ?? element.rotation ?? 0

  // Get clip path for corner shape
  const cornerRadius = element.cornerRadius || 0
  const cornerShape = element.cornerShape || 'round'
  const clipPath = getCornerClipPath(cornerShape, cornerRadius, currentWidth, currentHeight)
  const needsScoopSvg = cornerShape === 'scoop' && cornerRadius > 0

  // Calculate crop offset for object-position
  // cropX/cropY are normalized (-1 to 1), convert to percentage offset
  const cropOffsetX = 50 + (element.cropX || 0) * 50
  const cropOffsetY = 50 + (element.cropY || 0) * 50

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
    opacity: element.opacity ?? 1,
    cursor: interactionMode === 'drag' ? 'grabbing' : 'grab',
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

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${cropOffsetX}% ${cropOffsetY}%`,
    clipPath: needsScoopSvg ? `url(#scoop-${element.id})` : clipPath,
    borderRadius: cornerShape === 'round' && cornerRadius > 0 ? `${cornerRadius}px` : 0,
    border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke || '#000000'}` : 'none',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  }

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onClick={handleWrapperClick}
      onMouseDown={handleDragStart}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect()
        onContextMenu?.(e)
      }}
    >
      {/* SVG clip path for scoop corners */}
      {needsScoopSvg && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={`scoop-${element.id}`} clipPathUnits="objectBoundingBox">
              <path
                d={getScoopSvgPath(cornerRadius / currentWidth, 1, currentHeight / currentWidth)}
                transform={`scale(${1 / currentWidth}, ${1 / currentHeight})`}
              />
            </clipPath>
          </defs>
        </svg>
      )}

      {/* Selection border */}
      {isSelected && <div className="selection-ui" style={selectionBorderStyle} />}

      {/* Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={imageStyle}
          draggable={false}
        />
      ) : (
        <div
          style={{
            ...imageStyle,
            backgroundColor: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
            fontSize: '14px',
          }}
        >
          Loading...
        </div>
      )}

      {/* Interaction Handles - only show when selected */}
      {isSelected && (
        <div className="selection-ui">
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
        </div>
      )}
    </div>
  )
}
