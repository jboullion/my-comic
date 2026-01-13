import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiInfo, FiLoader } from 'react-icons/fi'
import useProjectStore from '../stores/useProjectStore'
import useSeriesStore from '../stores/useSeriesStore'
import SeriesSelector from './series/SeriesSelector'

/**
 * NewProjectModal
 *
 * Modal for creating a new comic book project.
 * Options:
 * - Project title
 * - Series selection
 * - Save location (optional, uses File System Access API)
 */
export default function NewProjectModal({ defaultSeriesId = null }) {
  const navigate = useNavigate()
  const { isNewProjectModalOpen, closeNewProjectModal, createProject } = useProjectStore()
  const { series, seriesLoading, loadSeries, refreshSeriesCounts } = useSeriesStore()

  const [title, setTitle] = useState('')
  const [seriesId, setSeriesId] = useState(null)
  const [saveToFile, setSaveToFile] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  // Load series when modal opens (only if not already loaded/loading)
  useEffect(() => {
    if (isNewProjectModalOpen && series.length === 0 && !seriesLoading) {
      loadSeries()
    }
  }, [isNewProjectModalOpen, series.length, seriesLoading, loadSeries])

  // Set default series when modal opens (only if explicitly provided)
  useEffect(() => {
    if (isNewProjectModalOpen && defaultSeriesId) {
      setSeriesId(defaultSeriesId)
    }
  }, [isNewProjectModalOpen, defaultSeriesId])

  // Check if File System Access API is supported
  const hasFileSystemAccess = 'showSaveFilePicker' in window

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsCreating(true)

    try {
      const project = await createProject(title.trim() || 'Untitled Project', {}, seriesId)

      // If user wants to save to file immediately
      if (saveToFile && hasFileSystemAccess) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `${project.title}.cbproject`,
            types: [{
              description: 'Comic Book Project',
              accept: { 'application/json': ['.cbproject'] },
            }],
          })

          // Store the file handle for later saves
          const { projectsDb } = await import('../lib/db')
          await projectsDb.update(project.id, { fileHandle: handle })
        } catch (err) {
          // User cancelled file picker - that's okay, continue without file
          if (err.name !== 'AbortError') {
            console.error('Failed to set save location:', err)
          }
        }
      }

      // Refresh series counts
      refreshSeriesCounts()

      // Reset form
      setTitle('')
      setSeriesId(null)
      setSaveToFile(false)

      // Navigate to the new project
      navigate(`/app/project/${project.id}`)
    } catch (err) {
      setError('Failed to create project. Please try again.')
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setTitle('')
      setSeriesId(null)
      setSaveToFile(false)
      setError(null)
      closeNewProjectModal()
    }
  }

  if (!isNewProjectModalOpen) return null

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
          <h2 className="text-lg font-semibold">New Project</h2>
          <button 
            onClick={handleClose}
            disabled={isCreating}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Project Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Project Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Comic Book"
                disabled={isCreating}
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* Series Selection */}
            <SeriesSelector
              value={seriesId}
              onChange={setSeriesId}
              disabled={isCreating}
            />

            {/* Save Location Option */}
            {hasFileSystemAccess && (
              <div className="flex items-start gap-3">
                <input
                  id="saveToFile"
                  type="checkbox"
                  checked={saveToFile}
                  onChange={(e) => setSaveToFile(e.target.checked)}
                  disabled={isCreating}
                  className="mt-0.5 w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <label htmlFor="saveToFile" className="text-sm text-slate-300">
                  <span className="font-medium">Choose save location</span>
                  <p className="text-slate-500 mt-0.5">
                    Save directly to your computer. You can always export later.
                  </p>
                </label>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-slate-900/50 rounded-lg px-4 py-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                <p>
                  Your project is automatically saved in your browser. 
                  Export anytime to back up your work.
                </p>
              </div>
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
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
