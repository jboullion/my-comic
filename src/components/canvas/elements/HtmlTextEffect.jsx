import { useRef, useEffect, useCallback, useMemo } from 'react'
import useElementInteraction from '../../../hooks/useElementInteraction'
import SelectionHandles, { selectionBorderStyle } from './SelectionHandles'

/**
 * Generate SVG path for bend/arc effect
 * @param {number} width - Width of the text area
 * @param {number} height - Height of the text area
 * @param {number} bend - Bend amount (-100 to 100)
 */
function generateBendPath(width, height, bend) {
  const startX = 0
  const endX = width
  const midX = width / 2
  const baseY = height / 2

  // Bend controls how much the middle point moves up/down
  // Negative = curve up (smile), Positive = curve down (frown)
  const bendAmount = (bend / 100) * (height * 0.8)
  const controlY = baseY + bendAmount

  return `M ${startX},${baseY} Q ${midX},${controlY} ${endX},${baseY}`
}

/**
 * HTML Text Effect Element Component
 *
 * SVG-based comic text effects (POW!, BAM!, etc.)
 * Supports fill color, stroke, outer stroke, and path effects (bend, skew).
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
    // Effect properties
    effectType = 'none', // 'none', 'bend', 'perspective'
    bend = 0, // -100 to 100
    skewX = 0, // -45 to 45
    skewY = 0, // -45 to 45
  } = element

  // Generate unique ID for this element's path
  const pathId = `textPath-${element.id}`

  // Generate the appropriate path based on effect type
  const textPath = useMemo(() => {
    switch (effectType) {
      case 'bend':
        return generateBendPath(currentWidth, currentHeight, bend)
      default:
        return null
    }
  }, [effectType, currentWidth, currentHeight, bend])

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

      // For path effects, we need more height to accommodate curves
      const heightMultiplier = effectType === 'none' ? 1 : 1.5

      const newWidth = Math.max(bbox.width + padding + totalStroke * 2, 60)
      const newHeight = Math.max((bbox.height + padding + totalStroke * 2) * heightMultiplier, 40)

      // Only update if significantly different
      if (Math.abs(newWidth - element.width) > 5 || Math.abs(newHeight - element.height) > 5) {
        onChange({ width: newWidth, height: newHeight })
      }
    } catch (e) {
      // getBBox can fail if element isn't rendered yet
    }
  }, [element.width, element.height, element.strokeWidth, element.outerStrokeWidth, effectType, onChange])

  // Auto-resize when text or font properties change
  useEffect(() => {
    // Small delay to ensure SVG is rendered
    const timer = setTimeout(autoResize, 50)
    return () => clearTimeout(timer)
  }, [element.text, element.fontSize, element.fontFamily, element.letterSpacing, element.strokeWidth, element.outerStrokeWidth, effectType])

  // Calculate text anchor based on alignment
  const textAnchor = textAlign === 'left' ? 'start' : textAlign === 'right' ? 'end' : 'middle'
  const startOffset = textAlign === 'left' ? '0%' : textAlign === 'right' ? '100%' : '50%'
  const textX = textAlign === 'left' ? '5%' : textAlign === 'right' ? '95%' : '50%'

  // Perspective transform style
  const perspectiveStyle = effectType === 'perspective' ? {
    transform: `skewX(${skewX}deg) skewY(${skewY}deg)`,
    transformOrigin: 'center center',
  } : {}

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
    cursor: interactionMode === 'drag' ? 'grabbing' : 'grab',
    userSelect: 'none',
    zIndex: element.zIndex || 1,
    pointerEvents: 'auto',
  }

  const textStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    letterSpacing: `${letterSpacing}px`,
  }

  // Render text on path (for bend, circle, wave effects)
  const renderTextOnPath = () => (
    <>
      <defs>
        <path id={pathId} d={textPath} fill="none" />
      </defs>

      {/* Outer stroke layer (if enabled) */}
      {outerStrokeWidth > 0 && (
        <text style={textStyle}>
          <textPath
            href={`#${pathId}`}
            startOffset={startOffset}
            textAnchor={textAnchor}
            fill="none"
            stroke={outerStroke}
            strokeWidth={strokeWidth + outerStrokeWidth * 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {text}
          </textPath>
        </text>
      )}

      {/* Main stroke layer */}
      {strokeWidth > 0 && (
        <text style={textStyle}>
          <textPath
            href={`#${pathId}`}
            startOffset={startOffset}
            textAnchor={textAnchor}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {text}
          </textPath>
        </text>
      )}

      {/* Fill layer */}
      <text ref={svgTextRef} style={textStyle}>
        <textPath
          href={`#${pathId}`}
          startOffset={startOffset}
          textAnchor={textAnchor}
          fill={fill}
        >
          {text}
        </textPath>
      </text>
    </>
  )

  // Render flat text (for 'none' and 'perspective' effects)
  const renderFlatText = () => (
    <text
      ref={svgTextRef}
      x={textX}
      y="50%"
      dominantBaseline="central"
      textAnchor={textAnchor}
      style={textStyle}
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
  )

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
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
          ...perspectiveStyle
        }}
      >
        {textPath ? renderTextOnPath() : renderFlatText()}
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
