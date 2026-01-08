import { useState, useEffect } from 'react'
import { charactersDb } from '../lib/characters'

// Global memory cache for character image URLs
const characterImageUrlCache = new Map()

/**
 * Hook to load and cache a character image URL from IndexedDB
 * Returns a blob URL string for use in <img src>
 * @param {number} imageId - Character image ID
 * @returns {string | null}
 */
export function useCharacterImageUrl(imageId) {
  const [imageUrl, setImageUrl] = useState(() => characterImageUrlCache.get(imageId) || null)
  const [prevImageId, setPrevImageId] = useState(imageId)

  // Adjust state if imageId changes during render
  if (imageId !== prevImageId) {
    setPrevImageId(imageId)
    setImageUrl(characterImageUrlCache.get(imageId) || null)
  }

  useEffect(() => {
    if (!imageId) return

    // If already in state and matches imageId, skip
    const cached = characterImageUrlCache.get(imageId)
    if (cached && imageUrl === cached) {
      return
    }

    let isMounted = true

    const loadImageUrl = async () => {
      try {
        const image = await charactersDb.getImage(imageId)
        if (!image || !image.blob) return

        const url = URL.createObjectURL(image.blob)
        if (isMounted) {
          characterImageUrlCache.set(imageId, url)
          setImageUrl(url)
        }
      } catch (error) {
        console.error('Failed to load character image URL:', imageId, error)
      }
    }

    loadImageUrl()

    return () => {
      isMounted = false
    }
  }, [imageId, imageUrl])

  return imageUrl
}

/**
 * Hook to load a character image URL from a blob directly
 * Useful when you already have the blob (e.g., from character.profileImage)
 * @param {Blob} blob - Image blob
 * @returns {string | null}
 */
export function useCharacterImageFromBlob(blob) {
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    if (!blob) {
      setImageUrl(null)
      return
    }

    const url = URL.createObjectURL(blob)
    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [blob])

  return imageUrl
}

/**
 * Clear the character image cache
 * Call this when a character image is updated/deleted
 * @param {number} imageId - Optional specific image ID to clear
 */
export function clearCharacterImageCache(imageId = null) {
  if (imageId) {
    const url = characterImageUrlCache.get(imageId)
    if (url) {
      URL.revokeObjectURL(url)
      characterImageUrlCache.delete(imageId)
    }
  } else {
    // Clear all
    characterImageUrlCache.forEach((url) => URL.revokeObjectURL(url))
    characterImageUrlCache.clear()
  }
}
