import React, { useRef, useEffect } from 'react'

/**
 * HTML Speech Bubble Component
 * Renders as a positioned div with SVG bubble and contenteditable text
 */
export default function HtmlSpeechBubble({ element, onSelect, onChange, isSelected, zoom = 1 }) {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, elemX: 0, elemY: 0 })

  // Update contenteditable text when element.text changes externally
  useEffect(() => {
    if (textRef.current && textRef.current.textContent !== element.text) {
      textRef.current.textContent = element.text || 'Type your text here...'
    }
  }, [element.text])

  const handleMouseDown = (e) => {
    // Don't start drag if clicking on the text for editing
    if (e.target === textRef.current) return
    
    e.stopPropagation()
    isDraggingRef.current = true
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: element.x,
      elemY: element.y,
    }
    onSelect()
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    
    const dx = (e.clientX - dragStartRef.current.x) / zoom
    const dy = (e.clientY - dragStartRef.current.y) / zoom
    
    onChange({
      x: dragStartRef.current.elemX + dx,
      y: dragStartRef.current.elemY + dy,
    })
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  useEffect(() => {
    if (isDraggingRef.current) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [element.x, element.y, zoom])

  const handleTextInput = (e) => {
    onChange({ text: e.currentTarget.textContent })
  }

  const handleTextClick = (e) => {
    e.stopPropagation()
    onSelect()
  }

  // Render SVG bubble shape
  const renderBubbleSvg = () => {
    const { width, height, bubbleStyle, cornerRadius = 20, fill = '#FFFFFF', stroke = '#000000', strokeWidth = 2 } = element

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
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
    } else {
      // Round bubble - rounded rectangle
      return (
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
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

  const containerStyle = {
    position: 'absolute',
    left: `${element.x - element.width / 2}px`,
    top: `${element.y - element.height / 2}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation || 0}deg)`,
    opacity: element.opacity || 1,
    cursor: 'move',
    userSelect: 'none',
    transformOrigin: 'center center',
    outline: isSelected ? '2px solid #3B82F6' : 'none',
    outlineOffset: '2px',
    zIndex: element.zIndex || 1,
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
    cursor: 'text',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onClick={handleTextClick}
    >
      {renderBubbleSvg()}
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleTextInput}
        style={textStyle}
      >
        {element.text || 'Type your text here...'}
      </div>
    </div>
  )
}
