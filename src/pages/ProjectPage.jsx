import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import useProjectStore from '../stores/useProjectStore'
import ComicCanvas from '../components/ComicCanvas'
import ProjectHeader from '../components/editor/ProjectHeader'
import PagesSidebar from '../components/editor/PagesSidebar'
import FloatingToolbar from '../components/editor/FloatingToolbar'
import PropertiesSidebar from '../components/editor/PropertiesSidebar'

export default function ProjectPage() {
  const { projectId } = useParams()
  const fileInputRef = useRef(null)
  
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
    activePageIndex,
    setActivePageIndex,
    tool,
    setTool,
    updateCurrentProjectLocal,
    addImage,
    addAssetToPage,
    selectedElementIds,
    setSelectedElementIds,
    selectedAssetId,
    setSelectedAssetId,
    addPanel,
  } = useProjectStore()

  const [isDraggingOver, setIsDraggingOver] = useState(false)

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
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      // Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveCurrentProject()
      }
      
      // Ctrl+Z to undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useProjectStore.temporal.getState().undo()
      }
      
      // Ctrl+Shift+Z or Ctrl+Y to redo
      if (((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) || ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault()
        useProjectStore.temporal.getState().redo()
      }

      // Delete / Backspace to delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        useProjectStore.getState().deleteSelectedElements()
      }

      // Arrow keys to nudge
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        const amount = e.shiftKey ? 10 : 1
        let dx = 0, dy = 0
        if (e.key === 'ArrowLeft') dx = -amount
        if (e.key === 'ArrowRight') dx = amount
        if (e.key === 'ArrowUp') dy = -amount
        if (e.key === 'ArrowDown') dy = amount
        useProjectStore.getState().nudgeSelectedElements(dx, dy)
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
  }

  const handleTitleChange = async (newTitle) => {
    if (newTitle.trim() !== currentProject?.title) {
      await updateCurrentProject({ title: newTitle.trim() })
    }
  }

  const handleSettingsChange = (key, value) => {
    const numValue = parseInt(value, 10) || 0
    updateCurrentProjectLocal({
      settings: {
        ...currentProject.settings,
        [key]: numValue
      }
    })
  }

  const applyPreset = (width, height) => {
    updateCurrentProjectLocal({
      settings: {
        ...currentProject.settings,
        width,
        height
      }
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      await addImage(file)
      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only show dropzone for external files
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        try {
          await addImage(file)
        } catch (error) {
          console.error('Image drop failed:', error)
          alert('Failed to upload dropped image.')
        }
      }
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
  const currentPage = pages[activePageIndex]
  const selectedElement = currentPage?.elements?.find(el => el.id === selectedElementIds[0])

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Project Header */}
        <ProjectHeader 
          project={currentProject}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onTitleChange={handleTitleChange}
          onSave={saveCurrentProject}
          onSaveToFile={handleSaveToFile}
        />

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Page Thumbnails */}
          <PagesSidebar 
            pages={pages}
            activePageIndex={activePageIndex}
            onPageSelect={setActivePageIndex}
            onAddPage={handleAddPage}
          />

          {/* Main Canvas Area */}
          <main 
            className="flex-1 min-w-0 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <ComicCanvas />
            
            {/* Drag & Drop Overlay */}
            {isDraggingOver && (
              <DragDropOverlay />
            )}
            
            {/* Floating Toolbar */}
            <FloatingToolbar 
              tool={tool}
              onToolChange={setTool}
              onAddPanel={addPanel}
              onImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
            />
          </main>

          {/* Right Sidebar - Properties Panel */}
          <PropertiesSidebar 
            currentProject={currentProject}
            currentPage={currentPage}
            activePageIndex={activePageIndex}
            selectedElement={selectedElement}
            selectedElementIds={selectedElementIds}
            selectedAssetId={selectedAssetId}
            onSelectElement={(id) => setSelectedElementIds([id])}
            onSelectAsset={setSelectedAssetId}
            onAddAsset={addAssetToPage}
            onSettingsChange={handleSettingsChange}
            onApplyPreset={applyPreset}
          />
        </div>
      </div>
    </AppLayout>
  )
}

/**
 * DragDropOverlay Component
 * Visual feedback when dragging files onto the canvas
 */
function DragDropOverlay() {
  return (
    <div className="absolute inset-0 z-50 bg-indigo-500/20 backdrop-blur-sm border-4 border-dashed border-indigo-500 flex items-center justify-center pointer-events-none">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-xl font-bold text-white">Drop to upload image</p>
        <p className="text-slate-400 text-sm">Supports PNG, JPG, WebP</p>
      </div>
    </div>
  )
}


