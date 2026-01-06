import { useRef, useState, useEffect, useCallback } from 'react'
import useProjectStore from '../stores/useProjectStore'

/**
 * Custom hook for coordinated dragging of multiple selected elements
 * When one element is dragged, all selected elements move together
 */
export default function useMultiElementDrag({
  selectedElementIds,
  elements,
  updateElement,
  zoom = 1,
}) {
  const { snapToGrid, snapGridSize } = useProjectStore()

  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({
    startMouseX: 0,
    startMouseY: 0,
    initialPositions: {}, // { [elementId]: { x, y } }
    triggerId: null, // The element that initiated the drag
  })

  const snapValue = useCallback((value) => {
    if (!snapToGrid) return value
    return Math.round(value / snapGridSize) * snapGridSize
  }, [snapToGrid, snapGridSize])

  /**
   * Start dragging all selected elements
   * @param {MouseEvent} e - The mouse event
   * @param {string} triggerId - The ID of the element being dragged
   */
  const startDrag = useCallback((e, triggerId) => {
    // Only handle left mouse button
    if (e.button !== 0) return

    // Store initial positions of ALL selected elements
    const positions = {}
    selectedElementIds.forEach(id => {
      const el = elements.find(elem => elem.id === id)
      if (el) {
        positions[id] = { x: el.x, y: el.y }
      }
    })

    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialPositions: positions,
      triggerId,
    }

    setIsDragging(true)
  }, [selectedElementIds, elements])

  /**
   * Handle mouse movement during drag
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const { startMouseX, startMouseY, initialPositions, triggerId } = dragRef.current

    // Calculate delta in canvas coordinates (accounting for zoom)
    const deltaX = (e.clientX - startMouseX) / zoom
    const deltaY = (e.clientY - startMouseY) / zoom

    // Get the trigger element for snap calculation
    const triggerInitial = initialPositions[triggerId]
    if (!triggerInitial) return

    // Calculate snapped position for the trigger element
    let snappedDeltaX = deltaX
    let snappedDeltaY = deltaY

    if (snapToGrid) {
      // Calculate where the trigger element's top-left would be
      const triggerElement = elements.find(el => el.id === triggerId)
      if (triggerElement) {
        const newCenterX = triggerInitial.x + deltaX
        const newCenterY = triggerInitial.y + deltaY
        const topLeftX = newCenterX - triggerElement.width / 2
        const topLeftY = newCenterY - triggerElement.height / 2
        const snappedTopLeftX = snapValue(topLeftX)
        const snappedTopLeftY = snapValue(topLeftY)
        const snappedCenterX = snappedTopLeftX + triggerElement.width / 2
        const snappedCenterY = snappedTopLeftY + triggerElement.height / 2
        snappedDeltaX = snappedCenterX - triggerInitial.x
        snappedDeltaY = snappedCenterY - triggerInitial.y
      }
    }

    // Update all selected elements with the same delta
    Object.entries(initialPositions).forEach(([id, initial]) => {
      updateElement(id, {
        x: initial.x + snappedDeltaX,
        y: initial.y + snappedDeltaY,
      })
    })
  }, [isDragging, zoom, snapToGrid, snapValue, elements, updateElement])

  /**
   * End dragging
   */
  const endDrag = useCallback(() => {
    setIsDragging(false)
    dragRef.current = {
      startMouseX: 0,
      startMouseY: 0,
      initialPositions: {},
      triggerId: null,
    }
  }, [])

  // Attach/detach global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', endDrag)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', endDrag)
      }
    }
  }, [isDragging, handleMouseMove, endDrag])

  return {
    isDragging,
    startDrag,
    endDrag,
  }
}
