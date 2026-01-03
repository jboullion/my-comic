import React, { useRef } from 'react'
import { Shape, Text } from 'react-konva'
import { drawSpeechBubblePath } from '../../../lib/canvasShapes'

/**
 * Speech Bubble Element Component
 * Renders a speech bubble with text and customizable style
 */
const SpeechBubbleElement = React.memo(({ element, onSelect, onChange }) => {
  const shapeRef = useRef(null)

  return (
    <>
      <Shape
        id={element.id}
        ref={shapeRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        offsetX={element.width / 2}
        offsetY={element.height / 2}
        fill={element.fill || '#FFFFFF'}
        stroke={element.stroke || '#000000'}
        strokeWidth={element.strokeWidth || 2}
        rotation={element.rotation}
        scaleX={element.scaleX}
        scaleY={element.scaleY}
        opacity={element.opacity}
        draggable
        onClick={onSelect}
        onTap={onSelect}
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
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransformEnd={() => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()

          // Reset scale and apply to width/height
          node.scaleX(1)
          node.scaleY(1)

          const newWidth = Math.max(50, node.width() * scaleX)
          const newHeight = Math.max(30, node.height() * scaleY)

          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          })
        }}
      />
      
      {/* Text inside the bubble */}
      <Text
        x={element.x}
        y={element.y}
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
        rotation={element.rotation}
        listening={false}
      />
    </>
  )
})

SpeechBubbleElement.displayName = 'SpeechBubbleElement'

export default SpeechBubbleElement
