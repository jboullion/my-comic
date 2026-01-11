import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { FiUploadCloud, FiSearch, FiX, FiChevronDown, FiCheck } from 'react-icons/fi'
import AssetThumbnail from '../ui/AssetThumbnail'
import { useAsset } from '../../../hooks/useAsset'
import useProjectStore from '../../../stores/useProjectStore'

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
]

/**
 * AssetGallery Component
 * Grid of asset thumbnails with search, sort, and filter capabilities
 */
export default function AssetGallery({
  imageIds,
  selectedAssetId,
  onSelect,
  onAdd,
  activePageIndex = 0,
  searchQuery = '',
  onSearchChange,
  sortBy = 'name-asc',
  onSortChange,
  showOnPageOnly = false,
  onShowOnPageOnlyChange,
  showUnusedOnly = false,
  onShowUnusedOnlyChange,
}) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const sortDropdownRef = useRef(null)
  const { addImage, getAssetsOnPage, getAssetUsageCount, isAssetUsed } = useProjectStore()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get assets on current page for filtering
  const assetsOnCurrentPage = useMemo(() => {
    return new Set(getAssetsOnPage(activePageIndex))
  }, [getAssetsOnPage, activePageIndex])

  // Handle filter checkbox changes (mutually exclusive)
  const handleOnPageChange = (checked) => {
    if (checked) {
      onShowUnusedOnlyChange?.(false)
    }
    onShowOnPageOnlyChange?.(checked)
  }

  const handleUnusedChange = (checked) => {
    if (checked) {
      onShowOnPageOnlyChange?.(false)
    }
    onShowUnusedOnlyChange?.(checked)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

      for (const file of imageFiles) {
        try {
          await addImage(file, { addToCanvas: false })
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      }
    }
  }

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort'
  const hasActiveFilters = searchQuery || showOnPageOnly || showUnusedOnly

  return (
    <div
      className="space-y-3 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Search and Sort Row */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap"
          >
            <span className="text-xs">{currentSortLabel}</span>
            <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[140px] py-1">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange?.(option.value)
                    setShowSortDropdown(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                    sortBy === option.value
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <FiCheck className={`w-3 h-3 ${sortBy === option.value ? 'opacity-100' : 'opacity-0'}`} />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Checkboxes */}
      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={showOnPageOnly}
            onChange={(e) => handleOnPageChange(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-slate-400 group-hover:text-slate-300 transition-colors">On Page</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={showUnusedOnly}
            onChange={(e) => handleUnusedChange(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-slate-400 group-hover:text-slate-300 transition-colors">Unused</span>
        </label>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange?.('')
              onShowOnPageOnlyChange?.(false)
              onShowUnusedOnlyChange?.(false)
            }}
            className="text-slate-500 hover:text-indigo-400 transition-colors ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Drop zone overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-10 bg-indigo-500/20 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <FiUploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm text-indigo-300 font-medium">Drop images here</p>
          </div>
        </div>
      )}

      {/* Asset Grid */}
      <AssetGrid
        imageIds={imageIds}
        selectedAssetId={selectedAssetId}
        onSelect={onSelect}
        onAdd={onAdd}
        searchQuery={searchQuery}
        sortBy={sortBy}
        showOnPageOnly={showOnPageOnly}
        showUnusedOnly={showUnusedOnly}
        assetsOnCurrentPage={assetsOnCurrentPage}
        getAssetUsageCount={getAssetUsageCount}
        isAssetUsed={isAssetUsed}
      />
    </div>
  )
}

/**
 * AssetGrid Component
 * Renders the filtered and sorted grid of assets
 */
function AssetGrid({
  imageIds,
  selectedAssetId,
  onSelect,
  onAdd,
  searchQuery,
  sortBy,
  showOnPageOnly,
  showUnusedOnly,
  assetsOnCurrentPage,
  getAssetUsageCount,
  isAssetUsed,
}) {
  // Load all asset metadata for filtering and sorting
  const [assetsData, setAssetsData] = useState({})

  // Register assets for metadata loading
  useEffect(() => {
    // We'll use individual AssetMetadataLoader components to load data
    setAssetsData({})
  }, [imageIds])

  const handleAssetLoaded = useCallback((id, data) => {
    setAssetsData(prev => ({ ...prev, [id]: data }))
  }, [])

  // Filter and sort assets
  const filteredAndSortedIds = useMemo(() => {
    let filtered = imageIds.filter(id => {
      const asset = assetsData[id]

      // Search filter
      if (searchQuery && asset?.name) {
        if (!asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
      }

      // On Page filter
      if (showOnPageOnly) {
        if (!assetsOnCurrentPage.has(id)) {
          return false
        }
      }

      // Unused filter
      if (showUnusedOnly) {
        if (isAssetUsed(id)) {
          return false
        }
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      const assetA = assetsData[a]
      const assetB = assetsData[b]

      if (!assetA || !assetB) return 0

      switch (sortBy) {
        case 'name-asc':
          return (assetA.name || '').localeCompare(assetB.name || '')
        case 'name-desc':
          return (assetB.name || '').localeCompare(assetA.name || '')
        case 'date-desc':
          return new Date(assetB.createdAt || 0) - new Date(assetA.createdAt || 0)
        case 'date-asc':
          return new Date(assetA.createdAt || 0) - new Date(assetB.createdAt || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [imageIds, assetsData, searchQuery, sortBy, showOnPageOnly, showUnusedOnly, assetsOnCurrentPage, isAssetUsed])

  // If no assets match filters
  const noResults = filteredAndSortedIds.length === 0 && imageIds.length > 0

  return (
    <>
      {/* Hidden metadata loaders */}
      {imageIds.map(id => (
        <AssetMetadataLoader key={id} id={id} onLoad={handleAssetLoaded} />
      ))}

      <div className="grid grid-cols-2 gap-3">
        {filteredAndSortedIds.map(id => (
          <AssetItem
            key={id}
            id={id}
            selected={selectedAssetId === id}
            onSelect={onSelect}
            onAdd={onAdd}
            usageCount={getAssetUsageCount(id)}
          />
        ))}
      </div>

      {noResults && (
        <div className="text-center py-6 px-4">
          <p className="text-sm text-slate-500">No assets match your filters</p>
          <p className="text-xs text-slate-600 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {imageIds.length === 0 && (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-800 rounded-xl">
          <FiUploadCloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Drop images here</p>
          <p className="text-xs text-slate-600 mt-1">or drag onto the canvas</p>
        </div>
      )}
    </>
  )
}

/**
 * AssetMetadataLoader Component
 * Loads asset metadata and reports it to parent
 */
function AssetMetadataLoader({ id, onLoad }) {
  const asset = useAsset(id)

  useEffect(() => {
    if (asset) {
      onLoad(id, asset)
    }
  }, [id, asset, onLoad])

  return null
}

/**
 * AssetItem Component
 * Individual asset with rename capability
 */
function AssetItem({ id, selected, onSelect, onAdd, usageCount = 0 }) {
  const asset = useAsset(id)
  const { renameAsset } = useProjectStore()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('')

  useEffect(() => {
    if (asset) setTempName(asset.name)
  }, [asset])

  const handleRename = async () => {
    if (tempName.trim() && tempName !== asset.name) {
      try {
        await renameAsset(id, tempName.trim())
      } catch (error) {
        setTempName(asset.name)
      }
    } else {
      setTempName(asset?.name || '')
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(id)}
        onDoubleClick={() => onAdd(id)}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('assetId', id)
          e.dataTransfer.effectAllowed = 'copy'
        }}
        className={`w-full aspect-square bg-slate-800 rounded-lg border overflow-hidden transition-all group relative ${
          selected
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        <AssetThumbnail assetId={id} usageCount={usageCount} />
        <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
      </button>

      {isEditing ? (
        <input
          autoFocus
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="w-full bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 text-[10px] text-white focus:outline-none"
        />
      ) : (
        <div
          className="text-[10px] text-slate-400 truncate px-1 cursor-pointer hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          title="Click to rename"
        >
          {asset?.name || 'Loading...'}
        </div>
      )}
    </div>
  )
}
