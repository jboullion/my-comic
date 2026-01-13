import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSettings, FiCpu, FiLoader, FiTrash2 } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import AppSidebarLayout from '../layouts/AppSidebarLayout'
import useSeriesStore from '../stores/useSeriesStore'
import AIModelSettingsTab from '../components/settings/AIModelSettingsTab'
import SeriesImageUpload from '../components/series/SeriesImageUpload'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import { seriesDb } from '../lib/series'

const TABS = [
  { id: 'general', label: 'General', icon: FiSettings },
  { id: 'ai-model', label: 'AI Models', icon: FiCpu }
]

/**
 * SeriesSettingsPage Component
 * Full-page settings for series with tabbed navigation
 */
export default function SeriesSettingsPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()
  const {
    updateSeries,
    updateSeriesCustomModel,
    setSeriesCoverImage,
    removeSeriesCoverImage,
    deleteSeries
  } = useSeriesStore()

  // Series data
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Tab state with localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('seriesSettingsTab') || 'general'
  })

  // Local settings state for editing
  const [localName, setLocalName] = useState('')
  const [localDescription, setLocalDescription] = useState('')
  const [localCustomModel, setLocalCustomModel] = useState(null)
  const [localCoverImage, setLocalCoverImage] = useState(null) // { file, url } for new, { blob, url } for existing

  // Save state for feedback
  const [saveState, setSaveState] = useState('idle') // 'idle' | 'saving' | 'saved'

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load series data
  useEffect(() => {
    async function loadSeries() {
      setLoading(true)
      setError(null)
      try {
        const seriesData = await seriesDb.getByIdWithCountsAndImage(Number(seriesId))
        if (!seriesData) {
          setError('Series not found')
        } else if (seriesData.name === 'Uncategorized') {
          // Redirect uncategorized to series page (can't edit settings)
          navigate(`/app/series/${seriesId}`)
          return
        } else {
          setSeries(seriesData)
          setLocalName(seriesData.name || '')
          setLocalDescription(seriesData.description || '')
          setLocalCustomModel(seriesData.customModel || {
            enabled: false,
            name: '',
            type: 'sdxl',
            url: '',
            allowMature: true  // Default to enabled for best image quality
          })
          // Set existing cover image if available
          if (seriesData.coverImageUrl) {
            setLocalCoverImage({ url: seriesData.coverImageUrl, existing: true })
          }
        }
      } catch (err) {
        console.error('Failed to load series:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSeries()
  }, [seriesId, navigate])

  // Save tab preference
  useEffect(() => {
    localStorage.setItem('seriesSettingsTab', activeTab)
  }, [activeTab])

  const handleBack = () => {
    navigate(`/app/series/${seriesId}`)
  }

  const handleSave = async () => {
    if (saveState !== 'idle') return

    setSaveState('saving')
    try {
      // Save general settings
      if (localName !== series.name || localDescription !== series.description) {
        await updateSeries(Number(seriesId), {
          name: localName.trim(),
          description: localDescription.trim()
        })
      }

      // Save cover image changes
      if (localCoverImage?.file) {
        // New image uploaded
        await setSeriesCoverImage(Number(seriesId), localCoverImage.file)
      } else if (!localCoverImage && series?.coverImageUrl) {
        // Image was removed
        await removeSeriesCoverImage(Number(seriesId))
      }

      // Save custom model settings
      await updateSeriesCustomModel(Number(seriesId), localCustomModel)

      // Reload series to get updated data
      const updatedSeries = await seriesDb.getByIdWithCountsAndImage(Number(seriesId))
      setSeries(updatedSeries)
      if (updatedSeries.coverImageUrl) {
        setLocalCoverImage({ url: updatedSeries.coverImageUrl, existing: true })
      }

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch (err) {
      console.error('Failed to save series settings:', err)
      setSaveState('idle')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSeries(Number(seriesId))
      navigate('/app/series')
    } catch (err) {
      console.error('Failed to delete series:', err)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCoverImageChange = (image) => {
    setLocalCoverImage(image)
  }

  const handleCoverImageRemove = () => {
    setLocalCoverImage(null)
  }

  if (loading) {
    return (
      <AppSidebarLayout>
        <div className="flex items-center justify-center min-h-100">
          <LoadingSpinner />
        </div>
      </AppSidebarLayout>
    )
  }

  if (error) {
    return (
      <AppSidebarLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ErrorMessage
            title="Failed to load series"
            message={error}
          />
          <Link
            to="/app/series"
            className="inline-flex items-center gap-2 mt-4 text-indigo-400 hover:text-indigo-300"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Series
          </Link>
        </div>
      </AppSidebarLayout>
    )
  }

  return (
    <AppSidebarLayout>
      <div className="flex flex-col h-screen bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Back to Series"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <RiBookShelfFill className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Series Settings</h1>
                <p className="text-sm text-slate-400">{series?.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveState !== 'idle'}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors min-w-20 ${
                saveState === 'saved'
                  ? 'bg-green-600 text-white'
                  : saveState === 'saving'
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {saveState === 'saved' ? 'Saved!' : saveState === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-white border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'aiModel' && localCustomModel?.enabled && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Series Information</h3>
                  <p className="text-xs text-slate-400">
                    Basic information about this series.
                  </p>
                </div>

                {/* Cover Image */}
                <SeriesImageUpload
                  label="Cover Image"
                  value={localCoverImage}
                  onChange={handleCoverImageChange}
                  onRemove={handleCoverImageRemove}
                />

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Series Name
                  </label>
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Enter series name"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Description
                  </label>
                  <textarea
                    value={localDescription}
                    onChange={(e) => setLocalDescription(e.target.value)}
                    placeholder="Describe this series..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-red-400 mb-4">Danger Zone</h3>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white font-medium">Delete this series</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Projects and characters in this series will be moved to "Uncategorized".
                          This action cannot be undone.
                        </p>
                      </div>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                            Confirm Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai-model' && (
              <AIModelSettingsTab
                settings={localCustomModel}
                onUpdate={setLocalCustomModel}
              />
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-500 text-center">
            AI model settings apply to all projects and characters in this series.
          </p>
        </div>
      </div>
    </AppSidebarLayout>
  )
}
