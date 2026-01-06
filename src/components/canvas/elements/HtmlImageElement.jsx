import { useRef } from 'react'
import { useImageUrl } from '../../../hooks/useImage'
import useElementInteraction from '../../../hooks/useElementInteraction'
import SelectionHandles, { selectionBorderStyle, secondarySelectionBorderStyle } from './SelectionHandles'

/**
 * HTML Image Element Component
 *
 * Renders images with CSS transforms and corner-shape.
 * Supports drag, resize, rotate interactions.
 */
export default function HtmlImageElement({ element, onSelect, onChange, onDragStart, onContextMenu, isSelected, isPrimary = true, zoom = 1 }) {
  const imageUrl = useImageUrl(element.assetId)
  const wrapperRef = useRef(null)

  const {
    interactionMode,
    handleDragStart,
    handleResizeStart,
    handleRotateStart,
    currentX,
    currentY,
    currentWidth,
    currentHeight,
    currentRotation,
  } = useElementInteraction({
    element,
    wrapperRef,
    onChange,
    onSelect,
    onDragStart,
    zoom,
    lockAspectRatio: element.lockAspectRatio,
  })

  const handleMouseDown = (e) => {
    if (e.target !== wrapperRef.current && e.target.tagName !== 'IMG') return
    handleDragStart(e)
  }

  // cornerRadius is stored as percentage (0-50)
  const cornerRadius = element.cornerRadius || 0
  const cornerShape = element.cornerShape || 'round'

  // Calculate crop offset for object-position
  const cropOffsetX = 50 + (element.cropX || 0) * 50
  const cropOffsetY = 50 + (element.cropY || 0) * 50

  const wrapperStyle = {
    position: 'absolute',
    // Round to avoid subpixel rendering artifacts
    left: `${Math.round(currentX - currentWidth / 2)}px`,
    top: `${Math.round(currentY - currentHeight / 2)}px`,
    width: `${Math.round(currentWidth)}px`,
    height: `${Math.round(currentHeight)}px`,
    transform: `rotate(${currentRotation}deg)`,
    transformOrigin: 'center center',
    opacity: element.opacity ?? 1,
    cursor: interactionMode === 'drag' ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: element.zIndex || 1,
    pointerEvents: 'auto',
  }

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${cropOffsetX}% ${cropOffsetY}%`,
    borderRadius: cornerRadius > 0 ? `${cornerRadius}%` : 0,
    cornerShape: cornerShape,
    border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke || '#000000'}` : 'none',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  }

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect(e)
        onContextMenu?.(e)
      }}
    >
      {/* Selection border */}
      {isSelected && (
        <div
          className="selection-ui"
          style={isPrimary ? selectionBorderStyle : secondarySelectionBorderStyle}
        />
      )}

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

      {/* Interaction Handles - only show when selected and primary */}
      {isSelected && (
        <SelectionHandles
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          isPrimary={isPrimary}
        />
      )}
    </div>
  )
}
