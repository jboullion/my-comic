import { useState, useEffect, useCallback } from 'react'
import { FiX, FiSearch, FiLoader, FiStar, FiGrid } from 'react-icons/fi'
import {
  fetchModels,
  getDownloadUrl,
  getLatestVersion,
  getTriggerWords,
  mapBaseModelToType,
  BASE_MODEL_OPTIONS,
  isCivitaiConfigured,
} from '../../lib/civitai'
import CivitAIModelCard from './CivitAIModelCard'

/**
 * CivitAI Model Browser Modal
 *
 * Reusable modal for browsing CivitAI models.
 * Mode determines the type filter (locked, hidden from user):
 * - 'checkpoint': Browse base models only
 * - 'lora': Browse LoRA models only
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Called when modal should close
 * @param {Function} props.onSelect - Called with selected model data: { name, url, type, triggerWords, thumbnail }
 * @param {'checkpoint' | 'lora'} props.mode - Browser mode (determines type filter)
 * @param {string} props.baseModelFilter - Optional: pre-filter to specific base model
 * @param {boolean} props.allowNsfw - Whether to include NSFW models in results
 */
export default function CivitAIBrowserModal({
  isOpen,
  onClose,
  onSelect,
  mode = 'checkpoint',
  baseModelFilter = '',
  allowNsfw = false,
}) {
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'favorites'
  const [query, setQuery] = useState('')
  const [baseModel, setBaseModel] = useState(baseModelFilter)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setModels([])
      setCursor(null)
      setSelectedModel(null)
      setError('')
      setBaseModel(baseModelFilter)
    }
  }, [isOpen, baseModelFilter])

  // Fetch models when search params change
  const loadModels = useCallback(async (append = false) => {
    if (!isCivitaiConfigured()) {
      setError('Please connect your CivitAI account in Profile > Connected Accounts')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Note: CivitAI's query parameter doesn't work reliably
      // So we fetch models and filter client-side by name
      const isFavorites = activeTab === 'favorites'

      const response = await fetchModels(mode, {
        // Don't use query parameter - CivitAI API returns empty results with it
        baseModels: baseModel ? [baseModel] : undefined,
        favorites: isFavorites,
        cursor: append ? cursor : undefined,
        limit: 50, // Fetch more for client-side filtering
        nsfw: allowNsfw,
      })

      let items = response.items

      // Client-side filtering by search query
      if (debouncedQuery) {
        const queryLower = debouncedQuery.toLowerCase()
        items = items.filter(model =>
          model.name.toLowerCase().includes(queryLower) ||
          model.creator?.username?.toLowerCase().includes(queryLower)
        )
      }

      if (append) {
        setModels((prev) => [...prev, ...items])
      } else {
        setModels(items)
      }

      setCursor(response.metadata.nextCursor || null)
      setHasMore(!!response.metadata.nextCursor)
    } catch (err) {
      console.error('Failed to fetch models:', err)
      setError(err.message || 'Failed to load models')
    } finally {
      setLoading(false)
    }
  }, [mode, debouncedQuery, baseModel, activeTab, cursor, allowNsfw])

  // Initial load and search changes
  useEffect(() => {
    if (isOpen) {
      loadModels(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, debouncedQuery, baseModel, activeTab, allowNsfw])

  const handleSelect = (model) => {
    setSelectedModel(model)
  }

  const handleConfirm = () => {
    if (!selectedModel) return

    const version = getLatestVersion(selectedModel)
    if (!version) {
      setError('No downloadable version found for this model')
      return
    }

    onSelect({
      id: selectedModel.id,
      versionId: version.id,
      name: selectedModel.name,
      url: getDownloadUrl(version.id),
      type: mapBaseModelToType(version.baseModel),
      baseModel: version.baseModel,
      triggerWords: getTriggerWords(selectedModel),
      thumbnail: selectedModel.modelVersions[0]?.images[0]?.url || null,
      creator: selectedModel.creator?.username,
    })

    onClose()
  }

  const modeLabel = mode === 'checkpoint' ? 'Checkpoint' : 'LoRA'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold">Browse CivitAI {modeLabel}s</h2>
            <p className="text-sm text-slate-500">
              Search and select a {modeLabel.toLowerCase()} to use
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FiStar className="w-4 h-4" />
            My Favorites
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 p-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${modeLabel.toLowerCase()}s...`}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Base model filter */}
          <select
            value={baseModel}
            onChange={(e) => setBaseModel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {BASE_MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => loadModels(false)}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Try again
              </button>
            </div>
          ) : loading && models.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {activeTab === 'favorites'
                ? `No favorited ${modeLabel.toLowerCase()}s found on CivitAI`
                : `No ${modeLabel.toLowerCase()}s found. Try a different search.`}
            </div>
          ) : (
            <>
              {/* Model grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {models.map((model) => (
                  <CivitAIModelCard
                    key={model.id}
                    model={model}
                    onSelect={handleSelect}
                    isSelected={selectedModel?.id === model.id}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => loadModels(true)}
                    disabled={loading}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <div className="text-sm text-slate-500">
            {selectedModel ? (
              <span>
                Selected: <span className="text-white">{selectedModel.name}</span>
              </span>
            ) : (
              <span>Click a {modeLabel.toLowerCase()} to select it</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedModel}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-medium transition-colors"
            >
              Select {modeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
