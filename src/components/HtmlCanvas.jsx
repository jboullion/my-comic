import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { toPng } from 'html-to-image'
import useProjectStore from '../stores/useProjectStore'
import HtmlImageElement from './canvas/elements/HtmlImageElement'
import HtmlSpeechBubble from './canvas/elements/HtmlSpeechBubble'
import ZoomControls from './canvas/ZoomControls'
import CanvasContextMenu from './canvas/CanvasContextMenu'

/**
 * HtmlCanvas Component
 *
 * Pure HTML/CSS canvas workspace that replaces Konva.js.
 * Enables html-to-image capture for thumbnails and exports.
 */
const HtmlCanvas = forwardRef(function HtmlCanvas(props, ref) {
  const containerRef = useRef(null)
  const pageRef = useRef(null)

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

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isPanningMode, setIsPanningMode] = useState(false)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })

  const currentPage = currentProject?.pages[activePageIndex]
  const projectSettings = currentProject?.settings || { width: 800, height: 1200 }
  const pageWidth = projectSettings.width
  const pageHeight = projectSettings.height

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
    const newZoom = Math.min(scaleX, scaleY, 1)

    setZoom(newZoom)

    // Center position
    setPanOffset({
      x: (containerRef.current.offsetWidth - pageWidth * newZoom) / 2,
      y: (containerRef.current.offsetHeight - pageHeight * newZoom) / 2
    })
  }, [pageWidth, pageHeight, setZoom])

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
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
   * Handle mouse wheel zoom with pointer following
   */
  const handleWheel = useCallback((e) => {
    e.preventDefault()

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate point on page that mouse is over
    const pointOnPageX = (mouseX - panOffset.x) / zoom
    const pointOnPageY = (mouseY - panOffset.y) / zoom

    // Calculate new zoom
    const speed = e.ctrlKey ? 0.1 : 0.05
    const delta = e.deltaY > 0 ? -speed : speed
    const newZoom = Math.max(0.1, Math.min(5, zoom * (1 + delta)))

    // Adjust pan to keep mouse over same page point
    const newPanX = mouseX - pointOnPageX * newZoom
    const newPanY = mouseY - pointOnPageY * newZoom

    setZoom(newZoom)
    setPanOffset({ x: newPanX, y: newPanY })
  }, [zoom, panOffset, setZoom])

  /**
   * Handle zoom reset (100%)
   */
  const handleZoomReset = useCallback(() => {
    setZoom(1)
    if (containerRef.current) {
      setPanOffset({
        x: (containerRef.current.offsetWidth - pageWidth) / 2,
        y: (containerRef.current.offsetHeight - pageHeight) / 2
      })
    }
  }, [pageWidth, pageHeight, setZoom])

  /**
   * Handle panning (Space + Drag or Middle Mouse)
   */
  const handleMouseDown = useCallback((e) => {
    // Middle mouse button (1) or Space key held
    if (e.button === 1 || (e.button === 0 && isPanningMode)) {
      e.preventDefault()
      setIsPanning(true)
      return
    }

    // Deselect if clicking on page background
    if (e.target === pageRef.current) {
      setSelectedElementIds([])
    }
  }, [isPanningMode, setSelectedElementIds])

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return

    setPanOffset(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }))
  }, [isPanning])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle space key for pan mode
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
   * Handle context menu (right click)
   */
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()

    // If clicking on page background, don't show menu
    if (e.target === pageRef.current) {
      setContextMenu({ visible: false, x: 0, y: 0 })
      return
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    })
  }, [])

  /**
   * Convert screen coordinates to page coordinates
   */
  const screenToPage = useCallback((screenX, screenY) => {
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: (screenX - rect.left - panOffset.x) / zoom,
      y: (screenY - rect.top - panOffset.y) / zoom
    }
  }, [panOffset, zoom])

  /**
   * Handle drop from sidebar
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const assetId = e.dataTransfer.getData('assetId')
    if (!assetId) return

    e.stopPropagation()

    const pos = screenToPage(e.clientX, e.clientY)
    addAssetToPage(Number(assetId), pos)
  }, [screenToPage, addAssetToPage])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    generateThumbnail: async () => {
      if (!pageRef.current) return null

      // Hide selection handles via CSS class (no state change = no flash)
      pageRef.current.classList.add('capturing')
      // Wait for browser to apply the style
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      try {
        const dataUrl = await toPng(pageRef.current, {
          width: pageWidth,
          height: pageHeight,
          pixelRatio: 0.5,
          style: {
            transform: 'none',
            transformOrigin: 'top left'
          }
        })

        // Scale to thumbnail size (150x200)
        return await scaleThumbnail(dataUrl, pageWidth, pageHeight)
      } catch (error) {
        console.error('Failed to generate thumbnail:', error)
        return null
      } finally {
        pageRef.current?.classList.remove('capturing')
      }
    },
    captureFullPage: async () => {
      if (!pageRef.current) return null

      // Hide selection handles via CSS class (no state change = no flash)
      pageRef.current.classList.add('capturing')
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      try {
        const result = await toPng(pageRef.current, {
          width: pageWidth,
          height: pageHeight,
          pixelRatio: 2,
          style: {
            transform: 'none',
            transformOrigin: 'top left'
          }
        })

        return result
      } catch (error) {
        console.error('Failed to capture full page:', error)
        return null
      } finally {
        pageRef.current?.classList.remove('capturing')
      }
    },
    getPageRef: () => pageRef.current
  }), [pageWidth, pageHeight])

  if (!currentProject) return null

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-slate-950 overflow-hidden"
      style={{ cursor: isPanningMode ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Transform container - applies zoom and pan */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {/* Page - the capturable element */}
        <div
          ref={pageRef}
          style={{
            width: pageWidth,
            height: pageHeight,
            backgroundColor: currentPage?.backgroundColor || projectSettings.backgroundColor || '#ffffff',
            position: 'relative',
            boxShadow: '5px 5px 20px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}
          onClick={(e) => {
            if (e.target === pageRef.current) {
              setSelectedElementIds([])
            }
          }}
          onContextMenu={handleContextMenu}
        >
          {/* Render all elements */}
          {currentPage?.elements?.map((element) => {
            if (element.type === 'speechBubble') {
              return (
                <HtmlSpeechBubble
                  key={element.id}
                  element={element}
                  isSelected={selectedElementIds.includes(element.id)}
                  onSelect={() => setSelectedElementIds([element.id])}
                  onChange={(updates) => updateElement(element.id, updates)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY
                    })
                  }}
                  zoom={zoom}
                />
              )
            }

            if (element.type === 'image') {
              return (
                <HtmlImageElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElementIds.includes(element.id)}
                  onSelect={() => setSelectedElementIds([element.id])}
                  onChange={(updates) => updateElement(element.id, updates)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY
                    })
                  }}
                  zoom={zoom}
                />
              )
            }

            return null
          })}
        </div>
      </div>

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
})

/**
 * Scale a data URL to thumbnail size
 */
async function scaleThumbnail(dataUrl, sourceWidth, sourceHeight) {
  const THUMBNAIL_WIDTH = 150
  const THUMBNAIL_HEIGHT = 200

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = THUMBNAIL_WIDTH
      canvas.height = THUMBNAIL_HEIGHT
      const ctx = canvas.getContext('2d')

      // Calculate scale to fit page into thumbnail while maintaining aspect ratio
      const scaleX = THUMBNAIL_WIDTH / sourceWidth
      const scaleY = THUMBNAIL_HEIGHT / sourceHeight
      const scale = Math.min(scaleX, scaleY)

      // Center the page in the thumbnail
      const scaledWidth = sourceWidth * scale
      const scaledHeight = sourceHeight * scale
      const offsetX = (THUMBNAIL_WIDTH - scaledWidth) / 2
      const offsetY = (THUMBNAIL_HEIGHT - scaledHeight) / 2

      // Fill with a neutral background
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)

      // Draw the scaled image
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

      resolve(canvas.toDataURL('image/png', 0.8))
    }
    img.onerror = () => {
      console.error('Failed to load image for thumbnail scaling')
      resolve(null)
    }
    img.src = dataUrl
  })
}

export default HtmlCanvas
