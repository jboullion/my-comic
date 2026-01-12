import AssetPropertiesWidget from './AssetPropertiesWidget'

/**
 * AssetPropertiesPopup Component
 * Popup that appears on the left side of the asset panel when an asset is selected
 */
export default function AssetPropertiesPopup({ assetId, onAdd, onClose }) {
  const handlePopupClick = (e) => {
    e.stopPropagation()
  }

  if (!assetId) return null

  return (
    <>
      {/* Backdrop - covers everything except the sidebar */}
      <div
        className="fixed inset-0 right-[400px] z-10"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-[360px] max-h-[calc(100vh-160px)] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 transition-all duration-200 ease-out"
        onClick={handlePopupClick}
      >
        <AssetPropertiesWidget
          assetId={assetId}
          onAdd={onAdd}
          showInPopup={true}
        />
      </div>
    </>
  )
}
