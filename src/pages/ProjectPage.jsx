import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import useProjectStore from '../stores/useProjectStore'

export default function ProjectPage() {
  const { projectId } = useParams()
  const [activePage, setActivePage] = useState(0)
  
  const { 
    currentProject,
    currentProjectLoading,
    currentProjectError,
    hasUnsavedChanges,
    isSaving,
    loadProject,
    clearCurrentProject,
    saveCurrentProject,
    saveToFile,
    addPage,
    updateCurrentProject,
  } = useProjectStore()

  // Load project on mount
  useEffect(() => {
    loadProject(projectId)
    return () => clearCurrentProject()
  }, [projectId, loadProject, clearCurrentProject])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveCurrentProject()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveCurrentProject])

  const handleSaveToFile = async () => {
    try {
      await saveToFile()
    } catch (error) {
      console.error('Save to file failed:', error)
    }
  }

  const handleAddPage = async () => {
    await addPage()
    // Switch to the new page
    setActivePage((currentProject?.pages?.length || 1))
  }

  const handleTitleChange = async (newTitle) => {
    if (newTitle.trim() !== currentProject?.title) {
      await updateCurrentProject({ title: newTitle.trim() })
    }
  }

  // Loading state
  if (currentProjectLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (currentProjectError || !currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <p className="text-slate-400 mb-6">{currentProjectError || "This project doesn't exist or was deleted."}</p>
            <Link 
              to="/projects"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const pages = currentProject.pages || []

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Project Header */}
        <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-4">
            <Link 
              to="/projects"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <EditableTitle 
                title={currentProject.title} 
                onSave={handleTitleChange}
              />
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-500">• Unsaved</span>
              )}
              {currentProject.fileHandle && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  Saved to file
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={saveCurrentProject}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleSaveToFile}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save As
            </button>
            <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Page Thumbnails */}
          <aside className="w-48 border-r border-slate-800 p-3 overflow-y-auto bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase">Pages</span>
              <button 
                onClick={handleAddPage}
                className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Add page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {/* Page Thumbnails */}
            <div className="space-y-2">
              {pages.map((page, index) => (
                <PageThumbnail 
                  key={index}
                  pageNumber={index + 1} 
                  isActive={activePage === index}
                  onClick={() => setActivePage(index)}
                />
              ))}
            </div>
          </aside>

          {/* Main Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-auto">
            <div className="text-center p-8">
              <div 
                className="bg-white rounded-lg shadow-xl flex items-center justify-center mb-4"
                style={{ 
                  width: currentProject.settings?.width || 800, 
                  height: currentProject.settings?.height || 1200,
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 250px)',
                }}
              >
                <div className="text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Page {activePage + 1}</p>
                  <p className="text-xs text-slate-500 mt-1">Konva.js canvas coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          <aside className="w-64 border-l border-slate-800 p-4 overflow-y-auto bg-slate-900">
            <h3 className="text-xs font-medium text-slate-400 uppercase mb-4">Properties</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-500 text-center">
                  Select an element to edit its properties
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Tools</h4>
                <div className="grid grid-cols-4 gap-1">
                  <ToolButton icon="pointer" label="Select" active />
                  <ToolButton icon="square" label="Panel" />
                  <ToolButton icon="image" label="Image" />
                  <ToolButton icon="type" label="Text" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Page Settings</h4>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Width</span>
                    <span>{currentProject.settings?.width || 800}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Height</span>
                    <span>{currentProject.settings?.height || 1200}px</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}

function EditableTitle({ title, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(title)

  const handleBlur = () => {
    setIsEditing(false)
    onSave(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setValue(title)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="font-medium bg-slate-800 border border-slate-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="font-medium hover:text-indigo-400 transition-colors"
      title="Click to edit"
    >
      {title}
    </button>
  )
}

function PageThumbnail({ pageNumber, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full aspect-[3/4] rounded-lg border-2 transition-colors ${
        isActive 
          ? 'border-indigo-500 bg-slate-800' 
          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
      }`}
    >
      <span className="text-xs text-slate-500">{pageNumber}</span>
    </button>
  )
}

function ToolButton({ icon, label, active = false }) {
  const icons = {
    pointer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
    square: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    type: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />,
  }

  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        active 
          ? 'bg-indigo-500 text-white' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
      title={label}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[icon]}
      </svg>
    </button>
  )
}
