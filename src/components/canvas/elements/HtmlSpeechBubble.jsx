import { useRef, useState } from 'react'
import useElementInteraction from '../../../hooks/useElementInteraction'
import SelectionHandles, { selectionBorderStyle } from './SelectionHandles'

/**
 * HTML Speech Bubble Component
 *
 * Structure:
 * 1. Wrapper div - handles positioning, transforms, and interaction handles (drag, resize, rotate)
 * 2. SVG element - renders the bubble shape (100% of wrapper size)
 * 3. Text div - contenteditable for inline text editing
 */
export default function HtmlSpeechBubble({ element, onSelect, onChange, onContextMenu, isSelected, zoom = 1 }) {
  const wrapperRef = useRef(null)
  const textRef = useRef(null)

  const [isEditing, setIsEditing] = useState(false)

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
    zoom,
    isDisabled: isEditing,
  })

  const handleWrapperClick = () => {
    if (!isEditing) {
      onSelect()
    }
  }

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

  const handleTextBlur = (e) => {
    setIsEditing(false)
    const newText = e.currentTarget.textContent || ''
    if (newText !== element.text) {
      onChange({ text: newText })
    }
  }

  /**
   * Generate SVG path for corner shape
   */
  const getCornerShapePath = (width, height, radius, cornerShape, strokeWidth) => {
    const sw = strokeWidth / 2
    const w = width - strokeWidth
    const h = height - strokeWidth
    const r = Math.min(radius, w / 2, h / 2)

    if (cornerShape === 'bevel') {
      return `M ${sw + r} ${sw} L ${sw + w - r} ${sw} L ${sw + w} ${sw + r} L ${sw + w} ${sw + h - r} L ${sw + w - r} ${sw + h} L ${sw + r} ${sw + h} L ${sw} ${sw + h - r} L ${sw} ${sw + r} Z`
    } else if (cornerShape === 'notch') {
      return `M ${sw + r} ${sw} L ${sw + w - r} ${sw} L ${sw + w - r} ${sw + r} L ${sw + w} ${sw + r} L ${sw + w} ${sw + h - r} L ${sw + w - r} ${sw + h - r} L ${sw + w - r} ${sw + h} L ${sw + r} ${sw + h} L ${sw + r} ${sw + h - r} L ${sw} ${sw + h - r} L ${sw} ${sw + r} L ${sw + r} ${sw + r} Z`
    } else if (cornerShape === 'scoop') {
      // Scoop uses arcs that curve inward (sweep-flag=1 for clockwise/inward)
      return `M ${sw + r} ${sw} L ${sw + w - r} ${sw} A ${r} ${r} 0 0 1 ${sw + w} ${sw + r} L ${sw + w} ${sw + h - r} A ${r} ${r} 0 0 1 ${sw + w - r} ${sw + h} L ${sw + r} ${sw + h} A ${r} ${r} 0 0 1 ${sw} ${sw + h - r} L ${sw} ${sw + r} A ${r} ${r} 0 0 1 ${sw + r} ${sw} Z`
    } else if (cornerShape === 'squircle') {
      const cp = r * 0.8
      return `M ${sw + r} ${sw} L ${sw + w - r} ${sw} C ${sw + w - (r - cp)} ${sw} ${sw + w} ${sw + r - cp} ${sw + w} ${sw + r} L ${sw + w} ${sw + h - r} C ${sw + w} ${sw + h - (r - cp)} ${sw + w - (r - cp)} ${sw + h} ${sw + w - r} ${sw + h} L ${sw + r} ${sw + h} C ${sw + r - cp} ${sw + h} ${sw} ${sw + h - (r - cp)} ${sw} ${sw + h - r} L ${sw} ${sw + r} C ${sw} ${sw + r - cp} ${sw + r - cp} ${sw} ${sw + r} ${sw} Z`
    } else {
      // Round (default)
      if (r <= 0) {
        return `M ${sw} ${sw} L ${sw + w} ${sw} L ${sw + w} ${sw + h} L ${sw} ${sw + h} Z`
      }
      return `M ${sw + r} ${sw} L ${sw + w - r} ${sw} A ${r} ${r} 0 0 1 ${sw + w} ${sw + r} L ${sw + w} ${sw + h - r} A ${r} ${r} 0 0 1 ${sw + w - r} ${sw + h} L ${sw + r} ${sw + h} A ${r} ${r} 0 0 1 ${sw} ${sw + h - r} L ${sw} ${sw + r} A ${r} ${r} 0 0 1 ${sw + r} ${sw} Z`
    }
  }

  const renderBubbleSvg = () => {
    const { bubbleStyle, cornerRadius = 0, cornerShape = 'round', fill = '#FFFFFF', stroke = '#000000', strokeWidth = 2 } = element
    const width = currentWidth
    const height = currentHeight
    // Convert percentage (0-50) to pixels based on smaller dimension
    // 50% = half of smaller dimension (max rounding for a circle)
    const radiusPx = (cornerRadius / 50) * (Math.min(width, height) / 2)

    if (bubbleStyle === 'cloud') {
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
      const shapePath = getCornerShapePath(width, height, radiusPx, cornerShape, strokeWidth)

      return (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <path d={shapePath} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
    }
  }

  const wrapperStyle = {
    position: 'absolute',
    // Round to avoid subpixel rendering artifacts
    left: `${Math.round(currentX - currentWidth / 2)}px`,
    top: `${Math.round(currentY - currentHeight / 2)}px`,
    width: `${Math.round(currentWidth)}px`,
    height: `${Math.round(currentHeight)}px`,
    transform: `rotate(${currentRotation}deg)`,
    transformOrigin: 'center center',
    opacity: element.opacity || 1,
    cursor: isEditing ? 'text' : (interactionMode === 'drag' ? 'grabbing' : 'grab'),
    userSelect: 'none',
    zIndex: element.zIndex || 1,
    pointerEvents: 'auto',
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
      {/* Selection border */}
      {isSelected && <div className="selection-ui" style={selectionBorderStyle} />}

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
        <SelectionHandles
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
        />
      )}
    </div>
  )
}
