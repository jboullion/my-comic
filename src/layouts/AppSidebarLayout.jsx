import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppSidebar from '../components/AppSidebar'

export default function AppSidebarLayout({ children }) {
  const { user, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
