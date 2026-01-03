import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Group, Image, Transformer, Shape } from 'react-konva'
import useProjectStore from '../stores/useProjectStore'
import { useImage } from '../hooks/useImage'

/**
 * Helper to draw corner shapes (CSS corner-shape property)
 */
const drawCornerShapePath = (ctx, width, height, radius, cornerShape) => {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  
  if (cornerShape === 'round' || !cornerShape || r <= 0) {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.arcTo(width, 0, width, r, r)
    ctx.lineTo(width, height - r)
    ctx.arcTo(width, height, width - r, height, r)
    ctx.lineTo(r, height)
    ctx.arcTo(0, height, 0, height - r, r)
    ctx.lineTo(0, r)
    ctx.arcTo(0, 0, r, 0, r)
  } else if (cornerShape === 'bevel') {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.lineTo(width, r)
    ctx.lineTo(width, height - r)
    ctx.lineTo(width - r, height)
    ctx.lineTo(r, height)
    ctx.lineTo(0, height - r)
    ctx.lineTo(0, r)
  } else if (cornerShape === 'notch') {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.lineTo(width - r, r)
    ctx.lineTo(width, r)
    ctx.lineTo(width, height - r)
    ctx.lineTo(width - r, height - r)
    ctx.lineTo(width - r, height)
    ctx.lineTo(r, height)
    ctx.lineTo(r, height - r)
    ctx.lineTo(0, height - r)
    ctx.lineTo(0, r)
    ctx.lineTo(r, r)
  } else if (cornerShape === 'scoop') {
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.arc(width, 0, r, Math.PI, Math.PI / 2, true)
    ctx.lineTo(width, height - r)
    ctx.arc(width, height, r, -Math.PI / 2, Math.PI, true)
    ctx.lineTo(r, height)
    ctx.arc(0, height, r, 0, -Math.PI / 2, true)
    ctx.lineTo(0, r)
    ctx.arc(0, 0, r, Math.PI / 2, 0, true)
  } else if (cornerShape === 'squircle') {
    // Approximation of a squircle (superellipse n=4)
    const cp = r * 0.8 
    ctx.moveTo(r, 0)
    ctx.lineTo(width - r, 0)
    ctx.bezierCurveTo(width - (r - cp), 0, width, r - cp, width, r)
    ctx.lineTo(width, height - r)
    ctx.bezierCurveTo(width, height - (r - cp), width - (r - cp), height, width - r, height)
    ctx.lineTo(r, height)
    ctx.bezierCurveTo(r - cp, height, 0, height - (r - cp), 0, height - r)
    ctx.lineTo(0, r)
    ctx.bezierCurveTo(0, r - cp, r - cp, 0, r, 0)
  }
  ctx.closePath()
}

/**
 * ComicCanvas Component
 * 
 * The main editing workspace using Konva.js.
 * Handles rendering, zoom, pan, and element manipulation.
 */
export default function ComicCanvas() {
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const transformerRef = useRef(null)
  
  const { 
    currentProject, 
    activePageIndex, 
    zoom, 
    setZoom,
    selectedElementIds,
    setSelectedElementIds,
    updateElement,
    addAssetToPage,
    reorderElements,
    deleteSelectedElements
  } = useProjectStore()

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })

  const currentPage = currentProject?.pages[activePageIndex]
  const projectSettings = currentProject?.settings || { width: 800, height: 1200 }
  const pageWidth = projectSettings.width
  const pageHeight = projectSettings.height

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current
      const selectedNodes = selectedElementIds
        .map(id => stage.findOne(`#${id}`))
        .filter(Boolean)
      
      transformerRef.current.nodes(selectedNodes)
      transformerRef.current.getLayer().batchDraw()
    }
  }, [selectedElementIds, activePageIndex])

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0 })
    window.addEventListener('click', handleClick)
    window.addEventListener('wheel', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('wheel', handleClick)
    }
  }, [])

  /**
   * Fit the page to the available screen space
   */
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return

    const padding = 40
    const availableWidth = containerRef.current.offsetWidth - padding
    const availableHeight = containerRef.current.offsetHeight - padding
    
    const scaleX = availableWidth / pageWidth
    const scaleY = availableHeight / pageHeight
    const newZoom = Math.min(scaleX, scaleY, 1) // Don't zoom past 100% by default
    
    setZoom(newZoom)
    
    // Center position
    setPosition({
      x: (containerRef.current.offsetWidth - pageWidth * newZoom) / 2,
      y: (containerRef.current.offsetHeight - pageHeight * newZoom) / 2
    })
  }, [pageWidth, pageHeight, setZoom])

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        })
      }
    }

    window.addEventListener('resize', updateSize)
    updateSize()
    
    // Initial center
    const timer = setTimeout(() => {
      handleFitToScreen()
    }, 100)

    return () => {
      window.removeEventListener('resize', updateSize)
      clearTimeout(timer)
    }
  }, [handleFitToScreen])

  /**
   * Handle mouse wheel zoom
   */
  const handleWheel = (e) => {
    e.evt.preventDefault()
    
    const stage = stageRef.current
    const oldScale = zoom
    
    // Zoom speed
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    const speed = e.evt.ctrlKey ? 0.1 : 0.05
    const newScale = e.evt.deltaY > 0 ? oldScale * (1 - speed) : oldScale * (1 + speed)
    
    // Limit zoom
    const limitedScale = Math.max(0.1, Math.min(newScale, 5))
    
    setZoom(limitedScale)
    setPosition({
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    })
  }

  /**
   * Handle panning (Space + Drag or Middle Mouse)
   */
  const handleMouseDown = (e) => {
    // Middle mouse button (1) or Space key held
    if (e.evt.button === 1 || (e.evt.button === 0 && isPanningMode)) {
      setIsPanning(true)
      return
    }
    
    // Deselect if clicking on empty area
    if (e.target === stageRef.current || e.target.name() === 'page-bg') {
      setSelectedElementIds([])
    }
  }

  /**
   * Handle context menu (right click)
   */
  const handleContextMenu = (e) => {
    e.evt.preventDefault()
    
    // If clicking on empty area, don't show menu
    if (e.target === stageRef.current || e.target.name() === 'page-bg') {
      setContextMenu({ visible: false, x: 0, y: 0 })
      return
    }

    // Select the element if not already selected
    const id = e.target.id()
    if (id && !selectedElementIds.includes(id)) {
      setSelectedElementIds([id])
    }

    setContextMenu({
      visible: true,
      x: e.evt.clientX,
      y: e.evt.clientY
    })
  }

  const handleMouseMove = (e) => {
    if (!isPanning) return
    
    setPosition({
      x: position.x + e.evt.movementX,
      y: position.y + e.evt.movementY
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Check if we are in panning mode (e.g. Space key held)
  const [isPanningMode, setIsPanningMode] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isPanningMode) {
        setIsPanningMode(true)
      }
    }
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsPanningMode(false)
        setIsPanning(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPanningMode])

  if (!currentProject) return null

  /**
   * Handle drop from sidebar
   */
  const handleDrop = (e) => {
    e.preventDefault()
    const assetId = e.dataTransfer.getData('assetId')
    if (!assetId || !stageRef.current) return

    e.stopPropagation()

    // Get pointer position relative to stage
    stageRef.current.setPointersPositions(e)
    const pointerPos = stageRef.current.getPointerPosition()
    
    if (!pointerPos) return

    // Convert screen coordinates to stage coordinates (accounting for zoom and pan)
    const stage = stageRef.current
    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointerPos)

    addAssetToPage(Number(assetId), {
      x: pos.x,
      y: pos.y
    })
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative bg-slate-950 overflow-hidden"
      style={{ cursor: isPanningMode ? 'grab' : 'default' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        x={position.x}
        y={position.y}
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {/* Page Background */}
          <Rect
            name="page-bg"
            x={0}
            y={0}
            width={pageWidth}
            height={pageHeight}
            fill={currentPage?.backgroundColor || projectSettings.backgroundColor || '#ffffff'}
            shadowBlur={20}
            shadowColor="rgba(0,0,0,0.5)"
            shadowOffset={{ x: 5, y: 5 }}
          />

          {/* Elements Layer */}
          <Group>
            {currentPage?.elements?.map((element) => (
              <ElementRenderer 
                key={element.id} 
                element={element} 
                isSelected={selectedElementIds.includes(element.id)}
                onSelect={() => setSelectedElementIds([element.id])}
                onChange={(updates) => updateElement(element.id, updates)}
              />
            ))}
          </Group>

          {/* Transformer Layer */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit minimum size
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox
              }
              return newBox
            }}
            rotateEnabled={true}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']}
            anchorSize={8}
            anchorCornerRadius={2}
            anchorStroke="#6366f1"
            anchorFill="#ffffff"
            borderStroke="#6366f1"
          />
        </Layer>
      </Stage>

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full px-4 py-2 shadow-xl z-10">
        <button 
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="p-1 hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-xs font-mono min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button 
          onClick={() => setZoom(Math.min(5, zoom + 0.1))}
          className="p-1 hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <div className="w-px h-4 bg-slate-700 mx-1" />
        <button 
          onClick={handleFitToScreen}
          className="text-xs font-medium hover:text-indigo-400 transition-colors"
        >
          Fit
        </button>
        <button 
          onClick={() => {
            setZoom(1)
            // Center it
            if (containerRef.current) {
              setPosition({
                x: (containerRef.current.offsetWidth - pageWidth) / 2,
                y: (containerRef.current.offsetHeight - pageHeight) / 2
              })
            }
          }}
          className="text-xs font-medium hover:text-indigo-400 transition-colors"
        >
          100%
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1.5 w-30 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem 
            label="Bring to Front" 
            onClick={() => {
              reorderElements(selectedElementIds, 'front')
              setContextMenu({ visible: false, x: 0, y: 0 })
            }}
          />
          <ContextMenuItem 
            label="Bring Forward" 
            onClick={() => {
              reorderElements(selectedElementIds, 'forward')
              setContextMenu({ visible: false, x: 0, y: 0 })
            }}
          />
          <ContextMenuItem 
            label="Send Backward" 
            onClick={() => {
              reorderElements(selectedElementIds, 'backward')
              setContextMenu({ visible: false, x: 0, y: 0 })
            }}
          />
          <ContextMenuItem 
            label="Send to Back" 
            onClick={() => {
              reorderElements(selectedElementIds, 'back')
              setContextMenu({ visible: false, x: 0, y: 0 })
            }}
          />
          <div className="h-px bg-slate-700 my-1" />
          <ContextMenuItem 
            label="Delete" 
            className="text-red-400 hover:bg-red-500 hover:text-white"
            onClick={() => {
              deleteSelectedElements()
              setContextMenu({ visible: false, x: 0, y: 0 })
            }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Context Menu Item Component
 */
function ContextMenuItem({ label, onClick, className = '' }) {
  return (
    <button 
      className={`w-full text-left px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-indigo-600 hover:text-white active:bg-indigo-700 active:scale-95 transition-all duration-150 ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

/**
 * Element Renderer
 */
function ElementRenderer({ element, isSelected, onSelect, onChange }) {
  if (element.type === 'image') {
    return (
      <ImageElement 
        element={element} 
        isSelected={isSelected} 
        onSelect={onSelect} 
        onChange={onChange} 
      />
    )
  }
  if (element.type === 'panel') {
    return (
      <PanelElement 
        element={element} 
        isSelected={isSelected} 
        onSelect={onSelect} 
        onChange={onChange} 
      />
    )
  }
  return null
}

/**
 * Panel Element Component
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

/**
 * Image Element Component
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
          ctx.drawImage(image, 0, 0, element.width, element.height)
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

