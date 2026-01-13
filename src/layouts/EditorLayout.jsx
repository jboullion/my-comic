import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * EditorLayout Component
 * Minimal layout for the project editor - no AppNav to maximize workspace
 */
export default function EditorLayout({ children }) {
  const { user, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {children}
    </div>
  )
}
