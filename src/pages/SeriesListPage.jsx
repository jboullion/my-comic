import { useEffect, useState } from 'react'
import { FiPlus, FiUpload, FiLoader } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import AppSidebarLayout from '../layouts/AppSidebarLayout'
import useSeriesStore from '../stores/useSeriesStore'
import SeriesCard from '../components/series/SeriesCard'
import SeriesModal from '../components/series/SeriesModal'
import EmptySeriesState from '../components/series/EmptySeriesState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import { importSeriesFromFile } from '../lib/seriesFile'

export default function SeriesListPage() {
  const [isImporting, setIsImporting] = useState(false)

  const {
    series,
    seriesLoading,
    seriesError,
    loadSeries,
    openSeriesModal,
    deleteSeries
  } = useSeriesStore()

  // Load series on mount
  useEffect(() => {
    loadSeries()
  }, [loadSeries])

  const handleImport = async () => {
    if (isImporting) return
    setIsImporting(true)
    try {
      const result = await importSeriesFromFile()
      if (result.success) {
        // Reload series list to show the imported series
        await loadSeries()
      }
    } catch (err) {
      console.error('Failed to import series:', err)
      alert('Failed to import series. Please check the file and try again.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <AppSidebarLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <RiBookShelfFill className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Series</h1>
              <p className="text-slate-400 text-sm">
                Organize your projects and characters into series
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              title="Import series from .myseries file"
            >
              {isImporting ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiUpload className="w-5 h-5" />
              )}
              Import
            </button>
            <button
              onClick={() => openSeriesModal()}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              New Series
            </button>
          </div>
        </div>

        {/* Loading State */}
        {seriesLoading && <LoadingSpinner />}

        {/* Error State */}
        {seriesError && (
          <ErrorMessage
            title="Failed to load series"
            message={seriesError}
            onRetry={loadSeries}
          />
        )}

        {/* Series Grid */}
        {!seriesLoading && !seriesError && series.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                onEdit={(ser) => openSeriesModal(ser)}
                onDelete={(id) => deleteSeries(id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!seriesLoading && !seriesError && series.length === 0 && (
          <EmptySeriesState onCreateNew={() => openSeriesModal()} />
        )}
      </div>

      {/* Series Modal */}
      <SeriesModal />
    </AppSidebarLayout>
  )
}
