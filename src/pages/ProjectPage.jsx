import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiLoader, FiFrown, FiUploadCloud } from 'react-icons/fi'
import EditorLayout from '../layouts/EditorLayout'
import useProjectStore from '../stores/useProjectStore'
import HtmlCanvas from '../components/HtmlCanvas'
import ProjectHeader from '../components/editor/ProjectHeader'
import PagesSidebar from '../components/editor/PagesSidebar'
import PropertiesSidebar from '../components/editor/PropertiesSidebar'
import ExportModal from '../components/editor/ExportModal'
import AIImageModal from '../components/editor/AIImageModal'
import { exportPagesToZip } from '../lib/export'

export default function ProjectPage() {
  const { projectId } = useParams()
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const isSavingRef = useRef(false)

  const {
    currentProject,
    currentProjectLoading,
    currentProjectError,
    hasUnsavedChanges,
    isSaving,
    loadProject,
    clearCurrentProject,
    saveCurrentProject,
    saveAsMyComic,
    addPage,
    reorderPages,
    updateCurrentProject,
    activePageIndex,
    setActivePageIndex,
    tool,
    setTool,
    addImage,
    addAssetToPage,
    addSpeechBubble,
    addText,
    addTextEffect,
    selectedElementIds,
    setSelectedElementIds,
    selectedAssetId,
    setSelectedAssetId,
  } = useProjectStore()

  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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

  // Combined auto-save + thumbnail generation (debounced 1 second)
  useEffect(() => {
    // Skip if no unsaved changes or currently saving
    if (!hasUnsavedChanges || isSavingRef.current) return

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set a new timer - generate thumbnail and save after 1 second of inactivity
    autoSaveTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return
      isSavingRef.current = true

      try {
        const state = useProjectStore.getState()
        const project = state.currentProject
        if (!project) return

        const pageIndex = state.activePageIndex

        // Generate thumbnail if canvas is available
        let updatedPages = project.pages
        if (canvasRef.current) {
          const thumbnail = await canvasRef.current.generateThumbnail()
          if (thumbnail) {
            updatedPages = [...project.pages]
            updatedPages[pageIndex] = {
              ...updatedPages[pageIndex],
              thumbnail
            }
          }
        }

        // Update state with thumbnail and save
        useProjectStore.setState({
          currentProject: { ...project, pages: updatedPages }
        })
        await state.saveCurrentProject()
      } finally {
        isSavingRef.current = false
      }
    }, 1000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, currentProject])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input or contentEditable
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return

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

      // Delete / Backspace to delete selected (prevent browser back navigation)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        useProjectStore.getState().deleteSelectedElements()
      }

      // Arrow keys to nudge selected elements
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const { selectedElementIds } = useProjectStore.getState()
        if (selectedElementIds.length > 0) {
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
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveCurrentProject])

  const handleSaveToFile = async () => {
    try {
      await saveAsMyComic()
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

  const handleAddSpeechBubble = async () => {
    try {
      await addSpeechBubble()
    } catch (error) {
      console.error('Failed to add speech bubble:', error)
    }
  }

  const handleAddText = () => {
    addText()
  }

  const handleAddTextEffect = () => {
    addTextEffect()
  }

  const handleAISave = async (file) => {
    try {
      await addImage(file)
    } catch (error) {
      console.error('Failed to save AI image:', error)
      throw error
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
      // Process all dropped image files
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

      if (imageFiles.length === 0) return

      try {
        // Add all images (sequentially to avoid race conditions)
        for (const file of imageFiles) {
          await addImage(file)
        }
      } catch (error) {
        console.error('Image drop failed:', error)
        alert('Failed to upload one or more dropped images.')
      }
    }
  }

  const handleExport = useCallback(async ({ format = 'webp' } = {}) => {
    if (!canvasRef.current || !currentProject) return

    setIsExporting(true)
    try {
      const quality = format === 'jpeg' ? 0.92 : 0.9
      const pages = await canvasRef.current.captureAllPages({
        format,
        quality
      })

      if (pages.length > 0) {
        await exportPagesToZip(pages, currentProject.title, format)
        setShowExportModal(false)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export pages. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [currentProject])

  // Loading state
  if (currentProjectLoading) {
    return (
      <EditorLayout>
        <div className="flex items-center justify-center h-screen">
          <FiLoader className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </EditorLayout>
    )
  }

  // Error state
  if (currentProjectError || !currentProject) {
    return (
      <EditorLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center">
            <FiFrown className="w-16 h-16 mx-auto text-slate-600 mb-4" />
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
      </EditorLayout>
    )
  }

  const pages = currentProject.pages || []
  const currentPage = pages[activePageIndex]
  // Get all selected elements for multi-select support
  const selectedElements = (currentPage?.elements || []).filter(el =>
    selectedElementIds.includes(el.id)
  )

  return (
    <EditorLayout>
      <div className="flex flex-col h-screen">
        {/* Project Header */}
        <ProjectHeader
          project={currentProject}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          isExporting={isExporting}
          onTitleChange={handleTitleChange}
          onSave={saveCurrentProject}
          onSaveToFile={handleSaveToFile}
          onExport={() => setShowExportModal(true)}
          tool={tool}
          onToolChange={setTool}
          onImageUpload={handleImageUpload}
          onAddSpeechBubble={handleAddSpeechBubble}
          onAddText={handleAddText}
          onAddTextEffect={handleAddTextEffect}
          onOpenAIModal={() => setShowAIModal(true)}
          fileInputRef={fileInputRef}
        />

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Page Thumbnails */}
          <PagesSidebar
            pages={pages}
            activePageIndex={activePageIndex}
            onPageSelect={setActivePageIndex}
            onAddPage={handleAddPage}
            onReorderPages={reorderPages}
          />

          {/* Main Canvas Area */}
          <main
            className="flex-1 min-w-0 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <HtmlCanvas ref={canvasRef} />

            {/* Drag & Drop Overlay */}
            {isDraggingOver && (
              <DragDropOverlay />
            )}
          </main>

          {/* Right Sidebar - Properties Panel */}
          <PropertiesSidebar
            currentProject={currentProject}
            selectedElements={selectedElements}
            selectedAssetId={selectedAssetId}
            onSelectAsset={setSelectedAssetId}
            onAddAsset={addAssetToPage}
            activePageIndex={activePageIndex}
          />
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {/* AI Image Modal */}
        <AIImageModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSave={handleAISave}
        />
      </div>
    </EditorLayout>
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
          <FiUploadCloud className="w-8 h-8 text-white" />
        </div>
        <p className="text-xl font-bold text-white">Drop to upload images</p>
        <p className="text-slate-400 text-sm">Supports PNG, JPG, WebP • Drop multiple at once</p>
      </div>
    </div>
  )
}


