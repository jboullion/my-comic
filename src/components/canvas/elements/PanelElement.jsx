import React, { useRef } from 'react'
import { Shape } from 'react-konva'
import { drawCornerShapePath } from '../../../lib/canvasShapes'

/**
 * Panel Element Component
 * Renders a comic panel with custom corner shapes
 */
const PanelElement = React.memo(({ element, onSelect, onChange }) => {
  const shapeRef = useRef(null)

  return (
    <Shape
      id={element.id}
      ref={shapeRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      offsetX={element.width / 2}
      offsetY={element.height / 2}
      fill={element.fill || '#ffffff'}
      stroke={element.stroke || '#000000'}
      strokeWidth={element.strokeWidth || 0}
      rotation={element.rotation}
      scaleX={element.scaleX}
      scaleY={element.scaleY}
      opacity={element.opacity}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      sceneFunc={(ctx, shape) => {
        drawCornerShapePath(ctx, element.width, element.height, element.cornerRadius || 0, element.cornerShape)
        ctx.fillStrokeShape(shape)
      }}
      hitFunc={(ctx, shape) => {
        drawCornerShapePath(ctx, element.width, element.height, element.cornerRadius || 0, element.cornerShape)
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

        node.scaleX(1)
        node.scaleY(1)

        const newWidth = Math.max(5, node.width() * scaleX)
        const newHeight = Math.max(5, node.height() * scaleY)

        onChange({
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        })
      }}
    />
  )
})

PanelElement.displayName = 'PanelElement'

export default PanelElement
