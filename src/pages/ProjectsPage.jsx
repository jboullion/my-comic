import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../layouts/AppLayout'
import NewProjectModal from '../components/NewProjectModal'
import useProjectStore from '../stores/useProjectStore'

export default function ProjectsPage() {
  const { user } = useAuth()
  const { 
    projects, 
    projectsLoading, 
    projectsError,
    loadProjects, 
    openNewProjectModal,
    openFromFile,
    deleteProject,
  } = useProjectStore()

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleOpenFromFile = async () => {
    try {
      const project = await openFromFile()
      if (project) {
        // Project loaded, list will refresh automatically
      }
    } catch (error) {
      console.error('Failed to open project:', error)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenFromFile}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              Open
            </button>
            <button 
              onClick={openNewProjectModal}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {/* Loading State */}
        {projectsLoading && (
          <div className="flex items-center justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Error State */}
        {projectsError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-red-400">
            <p className="font-medium">Failed to load projects</p>
            <p className="text-sm mt-1">{projectsError}</p>
            <button 
              onClick={loadProjects}
              className="mt-3 text-sm text-red-300 hover:text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!projectsLoading && !projectsError && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!projectsLoading && !projectsError && projects.length === 0 && (
          <EmptyState onCreateNew={openNewProjectModal} onOpenFile={handleOpenFromFile} />
        )}
      </div>

      {/* New Project Modal */}
      <NewProjectModal />
    </AppLayout>
  )
}

function ProjectCard({ project, onDelete }) {
  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      await onDelete()
    }
  }

  const pageCount = project.pages?.length || 0

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden relative"
    >
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 p-1.5 bg-slate-900/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Delete project"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* File Handle Indicator */}
      {project.fileHandle && (
        <div className="absolute top-2 left-2 z-10 p-1.5 bg-green-500/20 rounded-lg" title="Saved to file">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
          {project.title}
        </h3>
        <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
          <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ onCreateNew, onOpenFile }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
      <p className="text-slate-400 mb-6">Create your first comic book project to get started.</p>
      <div className="flex items-center justify-center gap-3">
        <button 
          onClick={onOpenFile}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
        >
          Open Existing
        </button>
        <button 
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
        >
          Create New Project
        </button>
      </div>
    </div>
  )
}

function formatDate(date) {
  if (!date) return ''
  
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
