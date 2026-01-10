import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiFolder, FiUsers, FiEdit2, FiDownload, FiLoader, FiSettings, FiCpu } from 'react-icons/fi'
import { RiBookShelfFill } from 'react-icons/ri'
import AppSidebarLayout from '../layouts/AppSidebarLayout'
import useSeriesStore from '../stores/useSeriesStore'
import useProjectStore from '../stores/useProjectStore'
import useCharactersStore from '../stores/useCharactersStore'
import ProjectCard from '../components/projects/ProjectCard'
import CharacterCard from '../components/characters/CharacterCard'
import NewProjectModal from '../components/NewProjectModal'
import CharacterModal from '../components/characters/CharacterModal'
import SeriesModal from '../components/series/SeriesModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import { seriesDb } from '../lib/series'
import { exportSeriesToFile } from '../lib/seriesFile'

export default function SeriesPage() {
  const { seriesId } = useParams()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const { openSeriesModal } = useSeriesStore()
  const {
    projects,
    projectsLoading,
    loadProjectsBySeries,
    openNewProjectModal,
    deleteProject
  } = useProjectStore()
  const {
    characters,
    charactersLoading,
    loadCharactersBySeries,
    openCharacterModal,
    deleteCharacter
  } = useCharactersStore()

  // Load series details
  useEffect(() => {
    async function loadSeries() {
      setLoading(true)
      setError(null)
      try {
        const seriesData = await seriesDb.getByIdWithCounts(Number(seriesId))
        if (!seriesData) {
          setError('Series not found')
        } else {
          setSeries(seriesData)
        }
      } catch (err) {
        console.error('Failed to load series:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSeries()
  }, [seriesId])

  // Load projects and characters for this series
  useEffect(() => {
    if (seriesId) {
      loadProjectsBySeries(Number(seriesId))
      loadCharactersBySeries(Number(seriesId))
    }
  }, [seriesId, loadProjectsBySeries, loadCharactersBySeries])

  const isContentLoading = projectsLoading || charactersLoading

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const result = await exportSeriesToFile(Number(seriesId))
      if (result.success) {
        // Export successful
      }
    } catch (err) {
      console.error('Failed to export series:', err)
      alert('Failed to export series. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <AppSidebarLayout>
        <div className="flex items-center justify-center min-h-[400px]">
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/app/series"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Series
        </Link>

        {/* Series Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <RiBookShelfFill className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{series?.name}</h1>
              {series?.description && (
                <p className="text-slate-400 mt-1">{series.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <FiFolder className="w-4 h-4" />
                  {series?.projectCount || 0} projects
                </span>
                <span className="flex items-center gap-1">
                  <FiUsers className="w-4 h-4" />
                  {series?.characterCount || 0} characters
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              title="Export series with characters"
            >
              {isExporting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiDownload className="w-4 h-4" />
              )}
              Export
            </button>
            {series?.name !== 'Uncategorized' && (
              <>
                <Link
                  to={`/app/series/${seriesId}/settings`}
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Series settings"
                >
                  <FiSettings className="w-4 h-4" />
                  Settings
                  {series?.customModel?.enabled && (
                    <FiCpu className="w-3 h-3 text-indigo-400" title="Custom AI model configured" />
                  )}
                </Link>
                <button
                  onClick={() => openSeriesModal(series)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiFolder className="w-5 h-5 text-indigo-400" />
              Projects
            </h2>
            <button
              onClick={openNewProjectModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {isContentLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => deleteProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <FiFolder className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No projects in this series yet</p>
              <button
                onClick={openNewProjectModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create first project
              </button>
            </div>
          )}
        </section>

        {/* Characters Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-indigo-400" />
              Characters
            </h2>
            <button
              onClick={() => openCharacterModal()}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              New Character
            </button>
          </div>

          {isContentLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={(char) => openCharacterModal(char)}
                  onDelete={(id) => deleteCharacter(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <FiUsers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No characters in this series yet</p>
              <button
                onClick={() => openCharacterModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create first character
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <NewProjectModal defaultSeriesId={Number(seriesId)} />
      <CharacterModal defaultSeriesId={Number(seriesId)} />
      <SeriesModal />
    </AppSidebarLayout>
  )
}
