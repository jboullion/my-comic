import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { toPng, toCanvas } from 'html-to-image'
import useProjectStore from '../stores/useProjectStore'
import { getEmbeddedFontCSS, preloadFonts } from '../utils/fontEmbed'
import HtmlImageElement from './canvas/elements/HtmlImageElement'
import HtmlSpeechBubble from './canvas/elements/HtmlSpeechBubble'
import HtmlTextElement from './canvas/elements/HtmlTextElement'
import HtmlTextEffect from './canvas/elements/HtmlTextEffect'
import ZoomControls from './canvas/ZoomControls'
import CanvasContextMenu from './canvas/CanvasContextMenu'
import CanvasRulers from './canvas/CanvasRulers'
import GridOverlay from './canvas/GridOverlay'
import useMultiElementDrag from '../hooks/useMultiElementDrag'

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
    deleteSelectedElements,
    showRulers,
    showGrid,
    snapGridSize
  } = useProjectStore()

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isPanningMode, setIsPanningMode] = useState(false)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })

  const currentPage = currentProject?.pages[activePageIndex]
  const projectSettings = currentProject?.settings || { width: 800, height: 1200, backgroundColor: '#ffffff' }
  // Per-page settings with fallback to project settings for backward compatibility
  const pageSettings = currentPage?.settings || projectSettings
  const pageWidth = pageSettings.width
  const pageHeight = pageSettings.height

  // Multi-element drag coordination hook
  const { startDrag: startMultiDrag } = useMultiElementDrag({
    selectedElementIds,
    elements: currentPage?.elements || [],
    updateElement,
    zoom,
  })

  /**
   * Handle element selection with modifier key support
   * - Click (no modifier): Replace selection with clicked element
   * - Ctrl/Cmd+Click: Toggle element in/out of selection
   * - Shift+Click: Add element to selection
   */
  const handleElementSelect = useCallback((elementId, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      // Toggle selection
      if (selectedElementIds.includes(elementId)) {
        setSelectedElementIds(selectedElementIds.filter(id => id !== elementId))
      } else {
        setSelectedElementIds([...selectedElementIds, elementId])
      }
    } else if (event?.shiftKey) {
      // Add to selection (if not already selected)
      if (!selectedElementIds.includes(elementId)) {
        setSelectedElementIds([...selectedElementIds, elementId])
      }
    } else {
      // Replace selection
      setSelectedElementIds([elementId])
    }
  }, [selectedElementIds, setSelectedElementIds])

  /**
   * Handle element drag start for multi-drag coordination
   * When dragging starts on an element that's part of a multi-selection,
   * trigger multi-drag so all selected elements move together
   * Returns true if multi-drag is handling the drag (so individual element should skip its own drag)
   */
  const handleElementDragStart = useCallback((elementId, event) => {
    // If multiple elements are selected and this element is one of them, start multi-drag
    if (selectedElementIds.length > 1 && selectedElementIds.includes(elementId)) {
      startMultiDrag(event, elementId)
      return true // Signal that multi-drag is handling this
    }
    return false
  }, [selectedElementIds, startMultiDrag])

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

  // Preload fonts for capture (runs once on mount)
  useEffect(() => {
    preloadFonts()
  }, [])

  /**
   * Fit the page to the available screen space
   */
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return

    const padding = 40
    const rulerOffset = showRulers ? 20 : 0
    const availableWidth = containerRef.current.offsetWidth - padding - rulerOffset
    const availableHeight = containerRef.current.offsetHeight - padding - rulerOffset

    const scaleX = availableWidth / pageWidth
    const scaleY = availableHeight / pageHeight
    const newZoom = Math.min(scaleX, scaleY, 1)

    setZoom(newZoom)

    // Center position (pan is relative to the area after rulers)
    setPanOffset({
      x: (containerRef.current.offsetWidth - rulerOffset - pageWidth * newZoom) / 2,
      y: (containerRef.current.offsetHeight - rulerOffset - pageHeight * newZoom) / 2
    })
  }, [pageWidth, pageHeight, setZoom, showRulers])

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

    // Ignore wheel events while panning (prevents accidental zoom during middle-click drag)
    if (isPanning) return

    const rect = containerRef.current.getBoundingClientRect()
    const rulerOffset = showRulers ? 20 : 0
    // Mouse position relative to the canvas area (after rulers)
    const mouseX = e.clientX - rect.left - rulerOffset
    const mouseY = e.clientY - rect.top - rulerOffset

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
  }, [zoom, panOffset, setZoom, isPanning, showRulers])

  /**
   * Handle zoom reset (100%)
   */
  const handleZoomReset = useCallback(() => {
    setZoom(1)
    if (containerRef.current) {
      const rulerOffset = showRulers ? 20 : 0
      setPanOffset({
        x: (containerRef.current.offsetWidth - rulerOffset - pageWidth) / 2,
        y: (containerRef.current.offsetHeight - rulerOffset - pageHeight) / 2
      })
    }
  }, [pageWidth, pageHeight, setZoom, showRulers])

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

  // Attach wheel listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

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
    const rulerOffset = showRulers ? 20 : 0
    return {
      x: (screenX - rect.left - panOffset.x - rulerOffset) / zoom,
      y: (screenY - rect.top - panOffset.y - rulerOffset) / zoom
    }
  }, [panOffset, zoom, showRulers])

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

  /**
   * Create a hidden clone of the page for capture (removes selection UI)
   * Returns { clone, cleanup } where cleanup removes the clone from DOM
   */
  const createCaptureClone = useCallback(() => {
    if (!pageRef.current) return null

    // Create a container that clips the clone (invisible but fully rendered)
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '1px'
    container.style.height = '1px'
    container.style.overflow = 'hidden'
    container.style.pointerEvents = 'none'

    // Clone the page element
    const clone = pageRef.current.cloneNode(true)

    // Remove all selection UI elements from the clone
    const selectionElements = clone.querySelectorAll('.selection-ui')
    selectionElements.forEach(el => el.remove())

    // Reset clone positioning (it will be positioned by container)
    clone.style.position = 'relative'
    clone.style.left = '0'
    clone.style.top = '0'

    container.appendChild(clone)
    document.body.appendChild(container)

    return {
      clone,
      cleanup: () => container.remove()
    }
  }, [])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    generateThumbnail: async () => {
      if (!pageRef.current) return null

      // Create off-screen clone without selection UI
      const capture = createCaptureClone()
      if (!capture) return null

      try {
        // Get embedded font CSS for proper font rendering
        const fontEmbedCSS = await getEmbeddedFontCSS()

        const dataUrl = await toPng(capture.clone, {
          width: pageWidth,
          height: pageHeight,
          pixelRatio: 0.5,
          fontEmbedCSS, // Embed fonts to avoid cross-origin errors
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
        capture.cleanup()
      }
    },
    /**
     * Capture full page as image
     * @param {Object} options - Capture options
     * @param {string} options.format - 'webp' | 'png' (default: 'webp')
     * @param {number} options.quality - Quality for webp (0-1, default: 0.9)
     */
    captureFullPage: async ({ format = 'webp', quality = 0.9 } = {}) => {
      if (!pageRef.current) return null

      // Create off-screen clone without selection UI
      const capture = createCaptureClone()
      if (!capture) return null

      try {
        // Get embedded font CSS for proper font rendering
        const fontEmbedCSS = await getEmbeddedFontCSS()

        // Use toCanvas for format flexibility
        const canvas = await toCanvas(capture.clone, {
          width: pageWidth,
          height: pageHeight,
          pixelRatio: 2,
          fontEmbedCSS,
          style: {
            transform: 'none',
            transformOrigin: 'top left'
          }
        })

        // Convert to desired format
        const mimeType = format === 'png' ? 'image/png' : 'image/webp'
        const result = canvas.toDataURL(mimeType, format === 'png' ? undefined : quality)

        return result
      } catch (error) {
        console.error('Failed to capture full page:', error)
        return null
      } finally {
        capture.cleanup()
      }
    },
    getPageRef: () => pageRef.current,
    /**
     * Capture all pages as images
     * @param {Object} options - Capture options
     * @param {string} options.format - 'webp' | 'png' | 'jpeg' (default: 'webp')
     * @param {number} options.quality - Quality for webp/jpeg (0-1, default: 0.9)
     * @param {Function} options.onProgress - Progress callback (pageIndex, totalPages)
     * @returns {Promise<Array<{index: number, dataUrl: string}>>}
     */
    captureAllPages: async ({ format = 'webp', quality = 0.9, onProgress } = {}) => {
      const state = useProjectStore.getState()
      const project = state.currentProject
      if (!project || !project.pages.length) return []

      const originalPageIndex = state.activePageIndex
      const pages = []

      for (let i = 0; i < project.pages.length; i++) {
        // Report progress
        if (onProgress) onProgress(i, project.pages.length)

        // Switch to the page
        state.setActivePageIndex(i)

        // Wait for React to re-render (two animation frames to ensure DOM is updated)
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve)
          })
        })

        // Small additional delay for any async content
        await new Promise(resolve => setTimeout(resolve, 50))

        // Create fresh clone after page switch
        const capture = createCaptureClone()
        if (!capture) continue

        try {
          const fontEmbedCSS = await getEmbeddedFontCSS()
          const pageData = project.pages[i]
          const pageSettings = pageData.settings || project.settings
          const width = pageSettings.width
          const height = pageSettings.height

          const canvas = await toCanvas(capture.clone, {
            width,
            height,
            pixelRatio: 2,
            fontEmbedCSS,
            style: {
              transform: 'none',
              transformOrigin: 'top left'
            }
          })

          const mimeTypes = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }
          const mimeType = mimeTypes[format] || 'image/webp'
          const dataUrl = canvas.toDataURL(mimeType, format === 'png' ? undefined : quality)

          pages.push({ index: i, dataUrl })
        } catch (error) {
          console.error(`Failed to capture page ${i + 1}:`, error)
        } finally {
          capture.cleanup()
        }
      }

      // Restore original page
      state.setActivePageIndex(originalPageIndex)

      return pages
    }
  }), [pageWidth, pageHeight, createCaptureClone])

  // Ruler size constant
  const RULER_SIZE = showRulers ? 20 : 0

  if (!currentProject) return null

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-slate-950 overflow-hidden"
      style={{ cursor: isPanningMode ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Canvas Rulers */}
      {showRulers && (
        <CanvasRulers
          zoom={zoom}
          panOffset={panOffset}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          gridSize={snapGridSize}
        />
      )}

      {/* Transform container - applies zoom and pan */}
      <div
        style={{
          transform: `translate(${panOffset.x + RULER_SIZE}px, ${panOffset.y + RULER_SIZE}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {/* Checkerboard background for transparent pages (not captured in exports) */}
        {pageSettings.backgroundColor === 'transparent' && (
          <div
            style={{
              position: 'absolute',
              width: pageWidth,
              height: pageHeight,
              backgroundImage: `
                linear-gradient(45deg, #404040 25%, transparent 25%),
                linear-gradient(-45deg, #404040 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #404040 75%),
                linear-gradient(-45deg, transparent 75%, #404040 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              backgroundColor: '#303030',
              boxShadow: '5px 5px 20px rgba(0,0,0,0.5)',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Page - the capturable element */}
        <div
          ref={pageRef}
          style={{
            width: pageWidth,
            height: pageHeight,
            backgroundColor: pageSettings.backgroundColor === 'transparent' ? 'transparent' : (pageSettings.backgroundColor || '#ffffff'),
            position: 'relative',
            boxShadow: pageSettings.backgroundColor === 'transparent' ? 'none' : '5px 5px 20px rgba(0,0,0,0.5)'
          }}
          onClick={(e) => {
            if (e.target === pageRef.current) {
              setSelectedElementIds([])
            }
          }}
          onContextMenu={handleContextMenu}
        >
          {/* Grid overlay (visual grid lines) */}
          {showGrid && <GridOverlay gridSize={snapGridSize} />}

          {/* Render all elements */}
          {currentPage?.elements?.map((element) => {
            const isSelected = selectedElementIds.includes(element.id)
            // Primary selection = first in the array, gets full handles
            const isPrimary = selectedElementIds.length <= 1 || selectedElementIds[0] === element.id

            if (element.type === 'speechBubble') {
              return (
                <HtmlSpeechBubble
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  isPrimary={isPrimary}
                  onSelect={(e) => handleElementSelect(element.id, e)}
                  onChange={(updates) => updateElement(element.id, updates)}
                  onDragStart={(e) => handleElementDragStart(element.id, e)}
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
                  isSelected={isSelected}
                  isPrimary={isPrimary}
                  onSelect={(e) => handleElementSelect(element.id, e)}
                  onChange={(updates) => updateElement(element.id, updates)}
                  onDragStart={(e) => handleElementDragStart(element.id, e)}
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

            if (element.type === 'text') {
              return (
                <HtmlTextElement
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  isPrimary={isPrimary}
                  onSelect={(e) => handleElementSelect(element.id, e)}
                  onChange={(updates) => updateElement(element.id, updates)}
                  onDragStart={(e) => handleElementDragStart(element.id, e)}
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

            if (element.type === 'textEffect') {
              return (
                <HtmlTextEffect
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  isPrimary={isPrimary}
                  onSelect={(e) => handleElementSelect(element.id, e)}
                  onChange={(updates) => updateElement(element.id, updates)}
                  onDragStart={(e) => handleElementDragStart(element.id, e)}
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

      resolve(canvas.toDataURL('image/webp', 0.8))
    }
    img.onerror = () => {
      console.error('Failed to load image for thumbnail scaling')
      resolve(null)
    }
    img.src = dataUrl
  })
}

export default HtmlCanvas
