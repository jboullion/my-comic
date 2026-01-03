import { useState, useEffect } from 'react'
import { imageAssets } from '../lib/images'

// Global memory cache for decoded images
const imageCache = new Map()

/**
 * Hook to load and cache an image from IndexedDB
 * @param {number} assetId 
 * @returns {HTMLImageElement | null}
 */
export function useImage(assetId) {
  const [image, setImage] = useState(() => imageCache.get(assetId) || null)

  useEffect(() => {
    if (!assetId) {
      if (image !== null) setImage(null)
      return
    }

    // If already in state and matches assetId, skip
    const cached = imageCache.get(assetId)
    if (cached && image === cached) {
      return
    }

    // Check cache first
    if (imageCache.has(assetId)) {
      setImage(imageCache.get(assetId))
      return
    }

    let isMounted = true

    const loadImage = async () => {
      try {
        const asset = await imageAssets.get(assetId)
        if (!asset || !asset.blob) return

        const url = URL.createObjectURL(asset.blob)
        const img = new Image()
        img.src = url
        img.onload = () => {
          if (isMounted) {
            imageCache.set(assetId, img)
            setImage(img)
          }
        }
      } catch (error) {
        console.error('Failed to load image asset:', assetId, error)
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [assetId, image])

  return image
}
