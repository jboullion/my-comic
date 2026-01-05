import { useRef, useEffect, useCallback } from 'react'
import useElementInteraction from '../../../hooks/useElementInteraction'
import SelectionHandles, { selectionBorderStyle } from './SelectionHandles'

/**
 * HTML Text Effect Element Component
 *
 * SVG-based comic text effects (POW!, BAM!, etc.)
 * Supports fill color, stroke, and outer stroke for layered outlines.
 * Text editing is done via properties panel only.
 */
export default function HtmlTextEffect({ element, onSelect, onChange, onContextMenu, isSelected, zoom = 1 }) {
  const wrapperRef = useRef(null)
  const svgTextRef = useRef(null)

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
  })

  const handleWrapperClick = () => {
    onSelect()
  }

  /**
   * Auto-resize element to fit text content
   */
  const autoResize = useCallback(() => {
    if (!svgTextRef.current) return

    // Get the bounding box of the SVG text
    try {
      const bbox = svgTextRef.current.getBBox()
      const padding = 20 // Extra padding for strokes
      const totalStroke = (element.strokeWidth || 3) + ((element.outerStrokeWidth || 0) * 2)

      const newWidth = Math.max(bbox.width + padding + totalStroke * 2, 60)
      const newHeight = Math.max(bbox.height + padding + totalStroke * 2, 40)

      // Only update if significantly different
      if (Math.abs(newWidth - element.width) > 5 || Math.abs(newHeight - element.height) > 5) {
        onChange({ width: newWidth, height: newHeight })
      }
    } catch (e) {
      // getBBox can fail if element isn't rendered yet
    }
  }, [element.width, element.height, element.strokeWidth, element.outerStrokeWidth, onChange])

  // Auto-resize when text or font properties change
  useEffect(() => {
    // Small delay to ensure SVG is rendered
    const timer = setTimeout(autoResize, 50)
    return () => clearTimeout(timer)
  }, [element.text, element.fontSize, element.fontFamily, element.letterSpacing, element.strokeWidth, element.outerStrokeWidth])

  const wrapperStyle = {
    position: 'absolute',
    left: `${currentX - currentWidth / 2}px`,
    top: `${currentY - currentHeight / 2}px`,
    width: `${currentWidth}px`,
    height: `${currentHeight}px`,
    transform: `rotate(${currentRotation}deg)`,
    transformOrigin: 'center center',
    opacity: element.opacity || 1,
    cursor: interactionMode === 'drag' ? 'grabbing' : 'grab',
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
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${currentWidth} ${currentHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        <text
          ref={svgTextRef}
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

      {/* Interaction Handles - hide resize handles for text effects */}
      {isSelected && (
        <SelectionHandles
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          hideResizeHandles
        />
      )}
    </div>
  )
}
