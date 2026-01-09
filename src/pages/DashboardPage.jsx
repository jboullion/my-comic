import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiFolder, FiUsers, FiPlus, FiArrowRight, FiBook } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import AppSidebarLayout from '../layouts/AppSidebarLayout'
import useProjectStore from '../stores/useProjectStore'
import useCharactersStore from '../stores/useCharactersStore'
import NewProjectModal from '../components/NewProjectModal'
import { formatDate } from '../lib/utils'

function StatCard({ icon: Icon, label, value, to }) {
  return (
    <Link
      to={to}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-indigo-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <FiArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </Link>
  )
}

function RecentProjectCard({ project }) {
  const pageCount = project.pages?.length || 0

  return (
    <Link
      to={`/app/project/${project.id}`}
      className="flex items-center gap-4 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group"
    >
      {/* Thumbnail */}
      <div className="w-16 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
        {project.pages?.[0]?.thumbnail ? (
          <img
            src={project.pages[0].thumbnail}
            alt={project.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <FiBook className="w-5 h-5 text-slate-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
          {project.title}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          {pageCount} {pageCount === 1 ? 'page' : 'pages'} · {formatDate(project.updatedAt)}
        </p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    projects,
    projectsLoading,
    loadProjects,
    openNewProjectModal,
  } = useProjectStore()
  const {
    characters,
    charactersLoading,
    loadCharacters,
  } = useCharactersStore()

  // Load data on mount
  useEffect(() => {
    loadProjects()
    loadCharacters()
  }, [loadProjects, loadCharacters])

  // Get recent projects (last 5 by updatedAt)
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
  }, [projects])

  // Calculate total pages
  const totalPages = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.pages?.length || 0), 0)
  }, [projects])

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0]
  const isLoading = projectsLoading || charactersLoading

  return (
    <AppSidebarLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {userName}
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your comics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={FiFolder}
            label="Projects"
            value={isLoading ? '...' : projects.length}
            to="/app/projects"
          />
          <StatCard
            icon={FiUsers}
            label="Characters"
            value={isLoading ? '...' : characters.length}
            to="/app/characters"
          />
          <StatCard
            icon={FiBook}
            label="Total Pages"
            value={isLoading ? '...' : totalPages}
            to="/app/projects"
          />
        </div>

        {/* Recent Projects */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link
              to="/app/projects"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              View all
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <RecentProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <FiBook className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No projects yet</p>
              <button
                onClick={openNewProjectModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create your first project
              </button>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openNewProjectModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              New Project
            </button>
            <Link
              to="/app/characters"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              <FiUsers className="w-4 h-4" />
              Manage Characters
            </Link>
            <Link
              to="/docs"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Documentation
            </Link>
          </div>
        </section>
      </div>

      {/* New Project Modal */}
      <NewProjectModal />
    </AppSidebarLayout>
  )
}
