import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Group } from 'react-konva'
import useProjectStore from '../stores/useProjectStore'

/**
 * ComicCanvas Component
 * 
 * The main editing workspace using Konva.js.
 * Handles rendering, zoom, pan, and element manipulation.
 */
export default function ComicCanvas() {
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  
  const { 
    currentProject, 
    activePageIndex, 
    zoom, 
    setZoom,
    setSelectedElementIds
  } = useProjectStore()

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  const currentPage = currentProject?.pages[activePageIndex]
  const projectSettings = currentProject?.settings || { width: 800, height: 1200 }
  const pageWidth = projectSettings.width
  const pageHeight = projectSettings.height

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
    // Middle mouse button (1) or Space key held (handled via global state if needed)
    if (e.evt.button === 1 || (e.evt.button === 0 && isPanningMode)) {
      setIsPanning(true)
    }
    
    // Deselect if clicking on empty area
    if (e.target === stageRef.current) {
      setSelectedElementIds([])
    }
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

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative bg-slate-950 overflow-hidden"
      style={{ cursor: isPanningMode ? 'grab' : 'default' }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        x={position.x}
        y={position.y}
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {/* Page Background */}
          <Rect
            x={0}
            y={0}
            width={pageWidth}
            height={pageHeight}
            fill={currentPage?.backgroundColor || projectSettings.backgroundColor || '#ffffff'}
            shadowBlur={20}
            shadowColor="rgba(0,0,0,0.5)"
            shadowOffset={{ x: 5, y: 5 }}
            listening={false} // Don't catch events on background
          />

          {/* Elements Layer */}
          <Group>
            {/* Elements will be rendered here */}
            {currentPage?.elements?.map((element) => (
              <ElementRenderer key={element.id} element={element} />
            ))}
          </Group>
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
    </div>
  )
}

/**
 * Placeholder for element rendering
 */
function ElementRenderer() {
  // This will be expanded in Phase 3
  return null
}
