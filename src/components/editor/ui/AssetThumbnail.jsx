import { useImage } from '../../../hooks/useImage'

/**
 * AssetThumbnail Component
 * Displays a thumbnail of an asset image
 */
export default function AssetThumbnail({ assetId }) {
  const image = useImage(assetId)
  
  if (!image) {
    return <div className="w-full h-full animate-pulse bg-slate-700" />
  }
  
  return (
    <img 
      src={image.src} 
      alt="Asset" 
      className="w-full h-full object-cover"
    />
  )
}
