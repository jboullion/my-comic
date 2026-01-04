import React, { useRef, useState, useEffect } from 'react'
import { Group, Shape, Text } from 'react-konva'
import { drawSpeechBubblePath } from '../../../lib/canvasShapes'

/**
 * Speech Bubble Element Component
 * Renders a speech bubble with text and customizable style
 */
const SpeechBubbleElement = React.memo(({ element, onSelect, onChange }) => {
  const groupRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)

  // Auto-focus and select text when editing starts
  useEffect(() => {
    if (!isEditing) return

    const textarea = document.getElementById(`textarea-${element.id}`)
    if (textarea) {
      setTimeout(() => {
        textarea.focus()
        textarea.select()
      }, 10)
    }
  }, [isEditing, element.id])

  // Cleanup textarea on unmount or when editing stops
  useEffect(() => {
    return () => {
      const textarea = document.getElementById(`textarea-${element.id}`)
      if (textarea) {
        textarea.remove()
      }
    }
  }, [element.id])

  // Create/update textarea in DOM
  useEffect(() => {
    if (isEditing) {
      const existingTextarea = document.getElementById(`textarea-${element.id}`)
      if (existingTextarea) {
        existingTextarea.remove()
      }

      const textarea = document.createElement('textarea')
      textarea.id = `textarea-${element.id}`
      textarea.value = element.text || ''
      
      // Apply styles
      const style = getTextareaStyle()
      Object.assign(textarea.style, style)
      
      // Event handlers
      textarea.addEventListener('input', (e) => {
        onChange({ text: e.target.value })
      })
      
      textarea.addEventListener('blur', () => {
        setIsEditing(false)
        textarea.remove()
      })
      
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setIsEditing(false)
          textarea.remove()
        }
        e.stopPropagation()
      })
      
      document.body.appendChild(textarea)
    }
  }, [isEditing])

  const handleDoubleClick = (e) => {
    e.cancelBubble = true
    setIsEditing(true)
  }

  // Calculate textarea position relative to stage
  const getTextareaStyle = () => {
    if (!groupRef.current) return { display: 'none' }
    
    const stage = groupRef.current.getStage()
    if (!stage) return { display: 'none' }

    const container = stage.container()
    const containerRect = container.getBoundingClientRect()
    
    // Get the absolute position of the group on the stage
    const absPos = groupRef.current.getAbsolutePosition()
    const scale = stage.scaleX() // Assuming uniform scale
    
    // Calculate position accounting for offset
    const x = containerRect.left + (absPos.x - element.width / 2) * scale
    const y = containerRect.top + (absPos.y - element.height / 2) * scale
    const width = element.width * scale
    const height = element.height * scale
    
    return {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      fontSize: `${(element.fontSize || 16) * scale}px`,
      fontFamily: element.fontFamily || 'Arial, sans-serif',
      textAlign: element.textAlign || 'center',
      padding: `${(element.padding || 10) * scale}px`,
      border: '2px solid #3B82F6',
      borderRadius: element.bubbleStyle === 'round' ? `${(element.cornerRadius || 20) * scale}px` : '0',
      background: 'rgba(255, 255, 255, 0.95)',
      color: element.textColor || '#000000',
      resize: 'none',
      outline: 'none',
      zIndex: 10000,
      transform: `rotate(${element.rotation || 0}deg)`,
      transformOrigin: 'center center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }
  }

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        })
      }}
      onTransformEnd={() => {
        const node = groupRef.current
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()

        // Reset scale and apply to width/height
        node.scaleX(1)
        node.scaleY(1)

        const newWidth = Math.max(50, element.width * scaleX)
        const newHeight = Math.max(30, element.height * scaleY)

        onChange({
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        })
      }}
    >
        {/* Bubble shape */}
        <Shape
          width={element.width}
          height={element.height}
          offsetX={element.width / 2}
          offsetY={element.height / 2}
          fill={element.fill || '#FFFFFF'}
          stroke={element.stroke || '#000000'}
          strokeWidth={element.strokeWidth || 2}
          opacity={element.opacity}
          sceneFunc={(ctx, shape) => {
            drawSpeechBubblePath(
              ctx, 
              element.width, 
              element.height, 
              element.bubbleStyle || 'round',
              element.cornerRadius || 20
            )
            ctx.fillStrokeShape(shape)
          }}
          hitFunc={(ctx, shape) => {
            drawSpeechBubblePath(
              ctx, 
              element.width, 
              element.height, 
              element.bubbleStyle || 'round',
              element.cornerRadius || 20
            )
            ctx.fillStrokeShape(shape)
          }}
        />
        
        {/* Text inside the bubble */}
        <Text
          width={element.width}
          height={element.height}
          offsetX={element.width / 2}
          offsetY={element.height / 2}
          text={element.text || 'Double-click to edit'}
          fontSize={element.fontSize || 16}
          fontFamily={element.fontFamily || 'Arial, sans-serif'}
          fill={element.textColor || '#000000'}
          align={element.textAlign || 'center'}
          verticalAlign={element.verticalAlign || 'middle'}
          padding={element.padding || 10}
          listening={false}
          visible={!isEditing}
        />
      </Group>
  )
})

SpeechBubbleElement.displayName = 'SpeechBubbleElement'
