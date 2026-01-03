import { useState, useEffect } from 'react'
import { imageAssets } from '../lib/images'

/**
 * Hook to load asset metadata from IndexedDB
 * @param {number} assetId 
 * @returns {Object | null}
 */
export function useAsset(assetId) {
  const [asset, setAsset] = useState(null)

  useEffect(() => {
    if (!assetId) {
      setAsset(null)
      return
    }

    let isMounted = true

    const loadAsset = async () => {
      try {
        const data = await imageAssets.get(assetId)
        if (isMounted) {
          setAsset(data)
        }
      } catch (error) {
        console.error('Failed to load asset:', assetId, error)
      }
    }

    loadAsset()

    // Listen for asset updates (we'll need a way to trigger this)
    const handleAssetUpdate = (e) => {
      if (e.detail.assetId === assetId) {
        loadAsset()
      }
    }

    window.addEventListener('asset-updated', handleAssetUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('asset-updated', handleAssetUpdate)
    }
  }, [assetId])

  return asset
}
