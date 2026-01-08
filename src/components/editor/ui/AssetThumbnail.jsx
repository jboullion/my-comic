import { useImage } from '../../../hooks/useImage'

/**
 * AssetThumbnail Component
 * Displays a thumbnail of an asset image with optional usage count badge
 */
export default function AssetThumbnail({ assetId, usageCount = 0 }) {
  const image = useImage(assetId)

  if (!image) {
    return <div className="w-full h-full animate-pulse bg-slate-700" />
  }

  return (
    <>
      <img
        src={image.src}
        alt="Asset"
        className="w-full h-full object-cover"
      />
      {usageCount > 0 && (
        <span className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full leading-none">
          ×{usageCount}
        </span>
      )}
    </>
  )
}
