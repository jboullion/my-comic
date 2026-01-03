import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva'
import useProjectStore from '../stores/useProjectStore'
import ElementRenderer from './canvas/elements/ElementRenderer'
import ZoomControls from './canvas/ZoomControls'
import CanvasContextMenu from './canvas/CanvasContextMenu'
import { drawCornerShapePath } from '../lib/canvasShapes'

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

  /**
   * Handle zoom reset (100%)
   */
  const handleZoomReset = useCallback(() => {
    setZoom(1)
    // Center it
    if (containerRef.current) {
      setPosition({
        x: (containerRef.current.offsetWidth - pageWidth) / 2,
        y: (containerRef.current.offsetHeight - pageHeight) / 2
      })
    }
  }, [pageWidth, pageHeight, setZoom])

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
            {currentPage?.elements?.map((element) => {
              // If it's a panel, render it as a clipping group
              if (element.type === 'panel') {
                const children = currentPage.elements.filter(el => el.panelId === element.id)
                
                return (
                  <Group 
                    key={element.id}
                    clipFunc={(ctx) => {
                      ctx.save()
                      ctx.translate(element.x, element.y)
                      ctx.rotate((element.rotation || 0) * Math.PI / 180)
                      ctx.scale(element.scaleX || 1, element.scaleY || 1)
                      ctx.translate(-element.width / 2, -element.height / 2)
                      drawCornerShapePath(ctx, element.width, element.height, element.cornerRadius || 0, element.cornerShape)
                      ctx.restore()
                    }}
                  >
                    {/* The panel itself (background/border) */}
                    <ElementRenderer 
                      element={element} 
                      isSelected={selectedElementIds.includes(element.id)}
                      onSelect={() => setSelectedElementIds([element.id])}
                      onChange={(updates) => updateElement(element.id, updates)}
                    />
                    
                    {/* Elements inside this panel */}
                    {children.map((child) => (
                      <ElementRenderer 
                        key={child.id} 
                        element={child} 
                        isSelected={selectedElementIds.includes(child.id)}
                        onSelect={() => setSelectedElementIds([child.id])}
                        onChange={(updates) => updateElement(child.id, updates)}
                      />
                    ))}
                  </Group>
                )
              }

              // If it's an element that belongs to a panel, skip it (it's rendered inside the panel group)
              if (element.panelId) return null

              // Otherwise render as base element
              return (
                <ElementRenderer 
                  key={element.id} 
                  element={element} 
                  isSelected={selectedElementIds.includes(element.id)}
                  onSelect={() => setSelectedElementIds([element.id])}
                  onChange={(updates) => updateElement(element.id, updates)}
                />
              )
            })}
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
      <ZoomControls 
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToScreen={handleFitToScreen}
        onReset={handleZoomReset}
      />

      {/* Context Menu */}
      <CanvasContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onBringToFront={() => reorderElements(selectedElementIds, 'front')}
        onBringForward={() => reorderElements(selectedElementIds, 'forward')}
        onSendBackward={() => reorderElements(selectedElementIds, 'backward')}
        onSendToBack={() => reorderElements(selectedElementIds, 'back')}
        onDelete={deleteSelectedElements}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0 })}
      />
    </div>
  )
}

