import React, { useRef, useEffect } from 'react'
import { Shape } from 'react-konva'
import { useImage } from '../../../hooks/useImage'
import { drawCornerShapePath } from '../../../lib/canvasShapes'

/**
 * Image Element Component
 * Renders an image with optional corner shapes and borders
 */
const ImageElement = React.memo(({ element, onSelect, onChange }) => {
  const image = useImage(element.assetId)
  const imageRef = useRef(null)

  // Set initial size based on image dimensions if not set
  useEffect(() => {
    if (image && !element.widthSet) {
      const aspectRatio = image.width / image.height
      const defaultWidth = 300
      onChange({ 
        width: defaultWidth, 
        height: defaultWidth / aspectRatio,
        widthSet: true 
      })
    }
  }, [image, element.widthSet, onChange])

  return (
    <Shape
      id={element.id}
      ref={imageRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      offsetX={element.width / 2}
      offsetY={element.height / 2}
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
        ctx.fillShape(shape)
        ctx.save()
        ctx.clip()
        if (image) {
          // Use normalized crop coordinates (0-1)
          const cx = (element.cropX || 0) * image.width
          const cy = (element.cropY || 0) * image.height
          const cw = (element.cropWidth || 1) * image.width
          const ch = (element.cropHeight || 1) * image.height
          
          ctx.drawImage(image, cx, cy, cw, ch, 0, 0, element.width, element.height)
        }
        ctx.restore()
        ctx.strokeShape(shape)
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
        const node = imageRef.current
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()

        // Reset scale and apply to width/height for cleaner data
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

ImageElement.displayName = 'ImageElement'

export default ImageElement
