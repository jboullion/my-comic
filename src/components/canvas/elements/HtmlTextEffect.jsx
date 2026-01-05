import { useRef, useState } from 'react'
import useElementInteraction from '../../../hooks/useElementInteraction'
import SelectionHandles, { selectionBorderStyle } from './SelectionHandles'

/**
 * HTML Text Effect Element Component
 *
 * SVG-based comic text effects (POW!, BAM!, etc.)
 * Supports fill color, stroke, and outer stroke for layered outlines.
 */
export default function HtmlTextEffect({ element, onSelect, onChange, onContextMenu, isSelected, zoom = 1 }) {
  const wrapperRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

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

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
    onSelect()

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 0)
  }

  const handleInputBlur = () => {
    setIsEditing(false)
  }

  const handleInputChange = (e) => {
    onChange({ text: e.target.value })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

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

  const {
    text = 'POW!',
    fontSize = 48,
    fontFamily = 'Bangers, cursive',
    fontWeight = 'bold',
    fill = '#FFFF00',
    stroke = '#000000',
    strokeWidth = 3,
    outerStroke = '#FF0000',
    outerStrokeWidth = 0,
    textAlign = 'center',
    letterSpacing = 2,
  } = element

  // Calculate text anchor based on alignment
  const textAnchor = textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle'
  const textX = textAlign === 'left' ? '5%' : textAlign === 'right' ? '95%' : '50%'

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onClick={handleWrapperClick}
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect()
        onContextMenu?.(e)
      }}
    >
      {/* Selection border */}
      {isSelected && <div className="selection-ui" style={selectionBorderStyle} />}

      {/* SVG Text Effect */}
      {!isEditing && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${currentWidth} ${currentHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
        >
          <text
            x={textX}
            y="50%"
            dominantBaseline="central"
            textAnchor={textAnchor}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              fontWeight: fontWeight,
              letterSpacing: `${letterSpacing}px`,
            }}
          >
            {/* Outer stroke layer (if enabled) */}
            {outerStrokeWidth > 0 && (
              <tspan
                fill="none"
                stroke={outerStroke}
                strokeWidth={strokeWidth + outerStrokeWidth * 2}
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                {text}
              </tspan>
            )}
            {/* Main stroke layer */}
            {strokeWidth > 0 && (
              <tspan
                x={textX}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                {text}
              </tspan>
            )}
            {/* Fill layer */}
            <tspan x={textX} fill={fill}>
              {text}
            </tspan>
          </text>
        </svg>
      )}

      {/* Text editing input overlay */}
      {isEditing && (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full bg-slate-800 text-white text-center outline-none border-2 border-indigo-500"
          style={{
            fontSize: `${Math.min(fontSize, 32)}px`,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
          }}
        />
      )}

      {/* Interaction Handles - hide resize handles for text effects */}
      {isSelected && !isEditing && (
        <SelectionHandles
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          hideResizeHandles
        />
      )}
    </div>
  )
}
