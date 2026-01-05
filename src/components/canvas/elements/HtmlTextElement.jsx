import { useRef, useState, useEffect, useCallback } from 'react'
import useElementInteraction from '../../../hooks/useElementInteraction'
import SelectionHandles, { selectionBorderStyle } from './SelectionHandles'

/**
 * HTML Text Element Component
 *
 * Simple text element for captions, narration, titles.
 * Uses contentEditable for inline text editing.
 * Auto-resizes to fit text content.
 */
export default function HtmlTextElement({ element, onSelect, onChange, onContextMenu, isSelected, zoom = 1 }) {
  const wrapperRef = useRef(null)
  const textRef = useRef(null)
  const measureRef = useRef(null)

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

  /**
   * Measure text and auto-resize element to fit content
   */
  const autoResize = useCallback((text) => {
    if (!measureRef.current) return

    const padding = element.padding || 8
    const fontSize = element.fontSize || 24
    const fontFamily = element.fontFamily || 'Arial, sans-serif'
    const fontWeight = element.fontWeight || 'normal'

    // Configure the measuring div
    measureRef.current.style.fontSize = `${fontSize}px`
    measureRef.current.style.fontFamily = fontFamily
    measureRef.current.style.fontWeight = fontWeight
    measureRef.current.style.padding = `${padding}px`
    measureRef.current.style.whiteSpace = 'pre-wrap'
    measureRef.current.style.wordWrap = 'break-word'
    measureRef.current.style.width = 'auto'
    measureRef.current.style.display = 'inline-block'
    measureRef.current.textContent = text || 'Double-click to edit'

    // Measure and update
    const measuredWidth = Math.max(measureRef.current.offsetWidth + 4, 50)
    const measuredHeight = Math.max(measureRef.current.offsetHeight + 4, fontSize + padding * 2)

    // Only update if significantly different (avoid micro-adjustments)
    if (Math.abs(measuredWidth - element.width) > 2 || Math.abs(measuredHeight - element.height) > 2) {
      onChange({ width: measuredWidth, height: measuredHeight })
    }
  }, [element.padding, element.fontSize, element.fontFamily, element.fontWeight, element.width, element.height, onChange])

  const handleTextBlur = (e) => {
    setIsEditing(false)
    const newText = e.currentTarget.textContent || ''
    if (newText !== element.text) {
      onChange({ text: newText })
      // Auto-resize after text change
      setTimeout(() => autoResize(newText), 0)
    }
  }

  // Auto-resize when font properties change
  useEffect(() => {
    if (!isEditing) {
      autoResize(element.text)
    }
  }, [element.fontSize, element.fontFamily, element.fontWeight, element.padding])

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

  const textStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: `${element.padding || 8}px`,
    fontSize: `${element.fontSize || 24}px`,
    fontFamily: element.fontFamily || 'Arial, sans-serif',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
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
    <>
      {/* Hidden measuring div for auto-resize */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      />

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

        {/* Interaction Handles */}
        {isSelected && !isEditing && (
          <SelectionHandles
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
          />
        )}
      </div>
    </>
  )
}
