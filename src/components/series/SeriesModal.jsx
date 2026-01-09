import { useState, useEffect } from 'react'
import { FiX, FiLoader } from 'react-icons/fi'
import useSeriesStore from '../../stores/useSeriesStore'
import SeriesImageUpload from './SeriesImageUpload'

/**
 * SeriesModal Component
 * Modal for creating and editing series
 */
export default function SeriesModal() {
  const {
    isSeriesModalOpen,
    editingSeries,
    closeSeriesModal,
    createSeries,
    updateSeries,
    setSeriesCoverImage
  } = useSeriesStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState(null) // { file, url } for new, { blob, url } for existing
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!editingSeries

  // Reset form when modal opens/closes or editing series changes
  useEffect(() => {
    if (isSeriesModalOpen) {
      if (editingSeries) {
        setName(editingSeries.name || '')
        setDescription(editingSeries.description || '')
        // Set existing cover image if available
        if (editingSeries.coverImage) {
          setCoverImage({
            blob: editingSeries.coverImage.blob,
            url: URL.createObjectURL(editingSeries.coverImage.blob),
            existing: true
          })
        } else {
          setCoverImage(null)
        }
      } else {
        setName('')
        setDescription('')
        setCoverImage(null)
      }
      setError(null)
    }
  }, [isSeriesModalOpen, editingSeries])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (coverImage?.url && !coverImage.existing) {
        URL.revokeObjectURL(coverImage.url)
      }
    }
  }, [coverImage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter a series name')
      return
    }

    setIsSaving(true)

    try {
      let seriesId

      if (isEditing) {
        await updateSeries(editingSeries.id, {
          name: name.trim(),
          description: description.trim()
        })
        seriesId = editingSeries.id
      } else {
        const newSeries = await createSeries(name.trim(), description.trim())
        seriesId = newSeries.id
      }

      // Upload cover image if a new one was selected
      if (coverImage?.file) {
        await setSeriesCoverImage(seriesId, coverImage.file)
      }

      // Modal will be closed by the store actions
    } catch (err) {
      console.error('Failed to save series:', err)
      setError(isEditing ? 'Failed to update series' : 'Failed to create series')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setCoverImage(null)
      closeSeriesModal()
    }
  }

  const handleCoverImageChange = (image) => {
    // Revoke old URL if it was created by us
    if (coverImage?.url && !coverImage.existing) {
      URL.revokeObjectURL(coverImage.url)
    }
    setCoverImage(image)
  }

  const handleCoverImageRemove = () => {
    if (coverImage?.url && !coverImage.existing) {
      URL.revokeObjectURL(coverImage.url)
    }
    setCoverImage(null)
  }

  if (!isSeriesModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Series' : 'New Series'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {/* Cover Image */}
            <SeriesImageUpload
              label="Cover Image (optional)"
              value={coverImage}
              onChange={handleCoverImageChange}
              onRemove={handleCoverImageRemove}
            />

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[10px] text-slate-500 uppercase font-bold mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Comic Series"
                disabled={isSaving}
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-[10px] text-slate-500 uppercase font-bold mb-2"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this series..."
                disabled={isSaving}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Series'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
