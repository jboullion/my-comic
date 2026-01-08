import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../layouts/AppLayout'
import NewProjectModal from '../components/NewProjectModal'
import useProjectStore from '../stores/useProjectStore'
import ProjectsHeader from '../components/projects/ProjectsHeader'
import ProjectCard from '../components/projects/ProjectCard'
import EmptyState from '../components/projects/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <ProjectsHeader
          userName={userName}
          onOpenFile={handleOpenFromFile}
          onCreateNew={openNewProjectModal}
        />

        {/* Loading State */}
        {projectsLoading && <LoadingSpinner />}

        {/* Error State */}
        {projectsError && (
          <ErrorMessage 
            title="Failed to load projects"
            message={projectsError}
            onRetry={loadProjects}
          />
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
          <EmptyState 
            onCreateNew={openNewProjectModal} 
            onOpenFile={handleOpenFromFile} 
          />
        )}
      </div>

      {/* New Project Modal */}
      <NewProjectModal />
    </AppLayout>
  )
}
