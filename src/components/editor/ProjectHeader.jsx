import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiChevronLeft, FiDownload, FiSettings, FiChevronDown, FiGrid, FiUser, FiLogOut, FiHelpCircle } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import EditableTitle from './ui/EditableTitle'
import FloatingToolbar from './FloatingToolbar'

/**
 * ProjectHeader Component
 * Top header bar with project title, save controls, navigation, and user menu
 */
export default function ProjectHeader({
  project,
  hasUnsavedChanges,
  isSaving,
  isExporting,
  onTitleChange,
  onSaveToFile,
  onExport,
  // Toolbar props
  tool,
  onToolChange,
  onImageUpload,
  onAddSpeechBubble,
  onAddText,
  onAddTextEffect,
  onOpenAIModal,
  fileInputRef
}) {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const { user, signOut } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isPWAInstallable, setIsPWAInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsPWAInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsPWAInstallable(false)
    }
    setDeferredPrompt(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="border-b border-slate-800 px-4 py-2 flex items-center justify-between bg-slate-900">
      <div className="flex items-center gap-4 min-w-[240px]">
        <Link
          to="/projects"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <EditableTitle
            title={project.title}
            onSave={onTitleChange}
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-500">Saving</span>
          )}
          {!hasUnsavedChanges && project.fileHandle && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              Saved
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="">
          <FloatingToolbar
            tool={tool}
            onToolChange={onToolChange}
            onImageUpload={onImageUpload}
            onAddSpeechBubble={onAddSpeechBubble}
            onAddText={onAddText}
            onAddTextEffect={onAddTextEffect}
            onOpenAIModal={onOpenAIModal}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-[240px] justify-end">
        <a
          href="/docs"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Documentation"
        >
          <FiHelpCircle className="w-4 h-4" />
        </a>
        <button
          onClick={() => navigate(`/project/${projectId}/settings`)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Project Settings"
        >
          <FiSettings className="w-4 h-4" />
        </button>
        <button
          onClick={onSaveToFile}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          <FiDownload className="w-4 h-4" />
          Save As
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative ml-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <img
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border-2 border-slate-700"
              />
              <FiChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {isPWAInstallable && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleInstall()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                      >
                        <FiDownload className="w-4 h-4" />
                        Install App
                      </button>
                    )}

                    <Link
                      to="/projects"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <FiGrid className="w-4 h-4" />
                      Projects
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleSignOut()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
