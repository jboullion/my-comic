import { useRef, useState, useEffect, useCallback } from 'react'
import useProjectStore from '../stores/useProjectStore'

/**
 * Custom hook for handling element interactions (drag, resize, rotate)
 * Shared between HtmlImageElement and HtmlSpeechBubble
 */
export default function useElementInteraction({
  element,
  wrapperRef,
  onChange,
  onSelect,
  zoom = 1,
  isDisabled = false, // e.g., when editing text in speech bubble
  lockAspectRatio = false,
}) {
  const { snapToGrid, snapGridSize } = useProjectStore()

  const [interactionMode, setInteractionMode] = useState(null) // 'drag' | 'resize' | 'rotate' | null
  const [localTransform, setLocalTransform] = useState(null)

  const interactionRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startRotation: 0,
    startElemX: 0,
    startElemY: 0,
    resizeHandle: null,
    centerX: 0,
    centerY: 0,
  })

  const snapValue = useCallback((value) => {
    if (!snapToGrid) return value
    return Math.round(value / snapGridSize) * snapGridSize
  }, [snapToGrid, snapGridSize])

  const getElementCenter = useCallback(() => {
    if (!wrapperRef.current) return { x: 0, y: 0 }
    const rect = wrapperRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [wrapperRef])

  const handleDragStart = useCallback((e) => {
    if (isDisabled) return
    // Only respond to left mouse button (0), ignore middle (1) and right (2)
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    setInteractionMode('drag')
    interactionRef.current = {
      ...interactionRef.current,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: element.x,
      startElemY: element.y,
    }

    onSelect()
  }, [isDisabled, element.x, element.y, onSelect])

  const handleResizeStart = useCallback((e, handle) => {
    // Only respond to left mouse button (0), ignore middle (1) and right (2)
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    setInteractionMode('resize')
    const center = getElementCenter()
    interactionRef.current = {
      ...interactionRef.current,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
      startElemX: element.x,
      startElemY: element.y,
      resizeHandle: handle,
      centerX: center.x,
      centerY: center.y,
      startRotation: element.rotation || 0,
    }
  }, [element.width, element.height, element.x, element.y, element.rotation, getElementCenter])

  const handleRotateStart = useCallback((e) => {
    // Only respond to left mouse button (0), ignore middle (1) and right (2)
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    setInteractionMode('rotate')
    const center = getElementCenter()
    interactionRef.current = {
      ...interactionRef.current,
      startX: e.clientX,
      startY: e.clientY,
      startRotation: element.rotation || 0,
      centerX: center.x,
      centerY: center.y,
    }
  }, [element.rotation, getElementCenter])

  const calculateTransform = useCallback((e) => {
    const {
      startX, startY, startWidth, startHeight,
      startElemX, startElemY, resizeHandle, centerX, centerY, startRotation
    } = interactionRef.current

    if (interactionMode === 'drag') {
      const dx = (e.clientX - startX) / zoom
      const dy = (e.clientY - startY) / zoom

      return {
        x: snapValue(startElemX + dx),
        y: snapValue(startElemY + dy),
      }
    } else if (interactionMode === 'resize') {
      const rotation = (startRotation || 0) * Math.PI / 180
      const dx = (e.clientX - startX) / zoom
      const dy = (e.clientY - startY) / zoom

      const cos = Math.cos(-rotation)
      const sin = Math.sin(-rotation)
      const localDx = dx * cos - dy * sin
      const localDy = dx * sin + dy * cos

      let newWidth = startWidth
      let newHeight = startHeight
      let localOffsetX = 0
      let localOffsetY = 0

      const isCorner = (resizeHandle.includes('n') || resizeHandle.includes('s')) &&
                       (resizeHandle.includes('e') || resizeHandle.includes('w'))
      const shouldLockAspect = lockAspectRatio && isCorner

      if (shouldLockAspect) {
        const aspectRatio = startWidth / startHeight
        const absLocalDx = Math.abs(localDx)
        const absLocalDy = Math.abs(localDy) * aspectRatio

        if (absLocalDx >= absLocalDy) {
          const sign = resizeHandle.includes('e') ? 1 : -1
          const widthDelta = sign * localDx
          newWidth = Math.max(50, startWidth + widthDelta)
          newHeight = Math.max(50, newWidth / aspectRatio)
          newWidth = newHeight * aspectRatio
        } else {
          const sign = resizeHandle.includes('s') ? 1 : -1
          const heightDelta = sign * localDy
          newHeight = Math.max(50, startHeight + heightDelta)
          newWidth = Math.max(50, newHeight * aspectRatio)
          newHeight = newWidth / aspectRatio
        }

        const widthChange = newWidth - startWidth
        const heightChange = newHeight - startHeight

        if (resizeHandle.includes('e')) localOffsetX += widthChange / 2
        if (resizeHandle.includes('w')) localOffsetX -= widthChange / 2
        if (resizeHandle.includes('s')) localOffsetY += heightChange / 2
        if (resizeHandle.includes('n')) localOffsetY -= heightChange / 2
      } else {
        if (resizeHandle.includes('e')) {
          const widthDelta = localDx
          newWidth = Math.max(50, startWidth + widthDelta)
          const actualDelta = newWidth - startWidth
          localOffsetX += actualDelta / 2
        }
        if (resizeHandle.includes('w')) {
          const widthDelta = -localDx
          newWidth = Math.max(50, startWidth + widthDelta)
          const actualDelta = newWidth - startWidth
          localOffsetX -= actualDelta / 2
        }
        if (resizeHandle.includes('s')) {
          const heightDelta = localDy
          newHeight = Math.max(30, startHeight + heightDelta)
          const actualDelta = newHeight - startHeight
          localOffsetY += actualDelta / 2
        }
        if (resizeHandle.includes('n')) {
          const heightDelta = -localDy
          newHeight = Math.max(30, startHeight + heightDelta)
          const actualDelta = newHeight - startHeight
          localOffsetY -= actualDelta / 2
        }
      }

      const worldOffsetX = localOffsetX * Math.cos(rotation) - localOffsetY * Math.sin(rotation)
      const worldOffsetY = localOffsetX * Math.sin(rotation) + localOffsetY * Math.cos(rotation)

      return {
        width: newWidth,
        height: newHeight,
        x: startElemX + worldOffsetX,
        y: startElemY + worldOffsetY,
      }
    } else if (interactionMode === 'rotate') {
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const startAngle = Math.atan2(startY - centerY, startX - centerX)
      const deltaAngle = (currentAngle - startAngle) * 180 / Math.PI

      let newRotation = startRotation + deltaAngle

      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15
      }

      return { rotation: newRotation }
    }

    return null
  }, [interactionMode, zoom, snapValue, lockAspectRatio])

  const handleMouseMove = useCallback((e) => {
    if (!interactionMode) return

    const newTransform = calculateTransform(e)
    if (newTransform) {
      setLocalTransform(newTransform)
    }
  }, [interactionMode, calculateTransform])

  const handleMouseUp = useCallback(() => {
    if (localTransform) {
      onChange(localTransform)
      setLocalTransform(null)
    }
    setInteractionMode(null)
  }, [localTransform, onChange])

  useEffect(() => {
    if (interactionMode) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [interactionMode, handleMouseMove, handleMouseUp])

  // Compute current values (local during interaction, element props otherwise)
  const currentX = localTransform?.x ?? element.x
  const currentY = localTransform?.y ?? element.y
  const currentWidth = localTransform?.width ?? element.width
  const currentHeight = localTransform?.height ?? element.height
  const currentRotation = localTransform?.rotation ?? element.rotation ?? 0

  return {
    interactionMode,
    handleDragStart,
    handleResizeStart,
    handleRotateStart,
    currentX,
    currentY,
    currentWidth,
    currentHeight,
    currentRotation,
  }
}
