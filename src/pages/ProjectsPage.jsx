import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../layouts/AppLayout'

// Placeholder project data - will come from Supabase later
const PLACEHOLDER_PROJECTS = [
  { id: '1', title: 'My First Comic', updatedAt: '2024-01-02', pages: 5, thumbnail: null },
  { id: '2', title: 'Space Adventure', updatedAt: '2024-01-01', pages: 12, thumbnail: null },
  { id: '3', title: 'Untitled Project', updatedAt: '2023-12-28', pages: 1, thumbnail: null },
]

export default function ProjectsPage() {
  const { user } = useAuth()
  
  // TODO: Fetch projects from Supabase/IndexedDB
  const projects = PLACEHOLDER_PROJECTS

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
          <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </AppLayout>
  )
}

function ProjectCard({ project }) {
  return (
    <Link
      to={`/project/${project.id}`}
      className="group block bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
          {project.title}
        </h3>
        <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
          <span>{project.pages} {project.pages === 1 ? 'page' : 'pages'}</span>
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
      <p className="text-slate-400 mb-6">Create your first comic book project to get started.</p>
      <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors">
        Create Your First Project
      </button>
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
