import { useState, useEffect } from 'react'
import { imageAssets } from '../lib/images'

// Global memory cache for decoded images (HTMLImageElement)
const imageCache = new Map()

// Global memory cache for image URLs (for HTML img elements)
const imageUrlCache = new Map()

/**
 * Hook to load and cache an image from IndexedDB
 * @param {number} assetId
 * @returns {HTMLImageElement | null}
 */
export function useImage(assetId) {
  const [image, setImage] = useState(() => imageCache.get(assetId) || null)
  const [prevAssetId, setPrevAssetId] = useState(assetId)

  // Adjust state if assetId changes during render
  if (assetId !== prevAssetId) {
    setPrevAssetId(assetId)
    setImage(imageCache.get(assetId) || null)
  }

  useEffect(() => {
    if (!assetId) return

    // If already in state and matches assetId, skip
    const cached = imageCache.get(assetId)
    if (cached && image === cached) {
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

/**
 * Hook to load and cache an image URL from IndexedDB
 * Returns a blob URL string for use in <img src>
 * @param {number} assetId
 * @returns {string | null}
 */
export function useImageUrl(assetId) {
  const [imageUrl, setImageUrl] = useState(() => imageUrlCache.get(assetId) || null)
  const [prevAssetId, setPrevAssetId] = useState(assetId)

  // Adjust state if assetId changes during render
  if (assetId !== prevAssetId) {
    setPrevAssetId(assetId)
    setImageUrl(imageUrlCache.get(assetId) || null)
  }

  useEffect(() => {
    if (!assetId) return

    // If already in state and matches assetId, skip
    const cached = imageUrlCache.get(assetId)
    if (cached && imageUrl === cached) {
      return
    }

    let isMounted = true

    const loadImageUrl = async () => {
      try {
        const asset = await imageAssets.get(assetId)
        if (!asset || !asset.blob) return

        const url = URL.createObjectURL(asset.blob)
        if (isMounted) {
          imageUrlCache.set(assetId, url)
          setImageUrl(url)
        }
      } catch (error) {
        console.error('Failed to load image asset URL:', assetId, error)
      }
    }

    loadImageUrl()

    return () => {
      isMounted = false
    }
  }, [assetId, imageUrl])

  return imageUrl
}
