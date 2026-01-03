import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import useProjectStore from '../stores/useProjectStore'
import ComicCanvas from '../components/ComicCanvas'
import { useImage } from '../hooks/useImage'
import { db } from '../lib/db'

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
    updateElement,
    addPanel,
  } = useProjectStore()

  const [rightSidebarTab, setRightSidebarTab] = useState('properties') // 'properties', 'assets', 'layers'
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
          <aside className="w-48 flex-shrink-0 border-r border-slate-800 p-3 overflow-y-auto bg-slate-900">
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
                  key={page.id || index}
                  pageNumber={index + 1} 
                  isActive={activePageIndex === index}
                  onClick={() => setActivePageIndex(index)}
                />
              ))}
            </div>
          </aside>

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
            )}
            
            {/* Floating Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-1.5 shadow-2xl z-10">
              <ToolButton 
                icon="pointer" 
                label="Select (V)" 
                active={tool === 'select'} 
                onClick={() => setTool('select')}
              />
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <ToolButton 
                icon="square" 
                label="Panel (P)" 
                active={tool === 'panel'} 
                onClick={() => {
                  setTool('panel')
                  addPanel()
                }}
              />
              <ToolButton 
                icon="image" 
                label="Image (I)" 
                active={tool === 'image'} 
                onClick={() => fileInputRef.current?.click()}
              />
              <ToolButton 
                icon="type" 
                label="Text (T)" 
                active={tool === 'text'} 
                onClick={() => setTool('text')}
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
          </main>

          {/* Right Sidebar - Properties Panel */}
          <aside className="w-72 flex-shrink-0 border-l border-slate-800 flex flex-col bg-slate-900">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setRightSidebarTab('properties')}
                className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  rightSidebarTab === 'properties' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Properties
              </button>
              <button 
                onClick={() => setRightSidebarTab('assets')}
                className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  rightSidebarTab === 'assets' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Assets
              </button>
              <button 
                onClick={() => setRightSidebarTab('layers')}
                className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  rightSidebarTab === 'layers' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Layers
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {rightSidebarTab === 'properties' && (
                <div className="space-y-6">
                  {selectedElement ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
                        </h3>
                        <button 
                          onClick={() => useProjectStore.getState().deleteSelectedElements()}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete element"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <PropertyInput 
                          label="X" 
                          value={Math.round(selectedElement.x)} 
                          onChange={(val) => updateElement(selectedElement.id, { x: val })}
                        />
                        <PropertyInput 
                          label="Y" 
                          value={Math.round(selectedElement.y)} 
                          onChange={(val) => updateElement(selectedElement.id, { y: val })}
                        />
                        <PropertyInput 
                          label="Width" 
                          value={Math.round(selectedElement.width)} 
                          onChange={(val) => updateElement(selectedElement.id, { width: val })}
                        />
                        <PropertyInput 
                          label="Height" 
                          value={Math.round(selectedElement.height)} 
                          onChange={(val) => updateElement(selectedElement.id, { height: val })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Opacity</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={selectedElement.opacity ?? 1}
                          onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Rotation</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={selectedElement.rotation || 0}
                            onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                            className="flex-1 accent-indigo-500"
                          />
                          <span className="text-xs text-slate-400 w-8">{Math.round(selectedElement.rotation || 0)}°</span>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Border Shape</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Color</label>
                            <input 
                              type="color" 
                              value={selectedElement.stroke || '#000000'}
                              onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
                              className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
                            <input 
                              type="number" 
                              min="0"
                              value={selectedElement.strokeWidth || 0}
                              onChange={(e) => updateElement(selectedElement.id, { strokeWidth: parseInt(e.target.value) || 0 })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Radius</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="range" 
                              min="0" 
                              max={Math.min(selectedElement.width, selectedElement.height) / 2} 
                              value={selectedElement.cornerRadius || 0}
                              onChange={(e) => updateElement(selectedElement.id, { cornerRadius: parseInt(e.target.value) })}
                              className="flex-1 accent-indigo-500"
                            />
                            <span className="text-xs text-slate-400 w-8">{selectedElement.cornerRadius || 0}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Style</label>
                            <select 
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                              value={
                                selectedElement.cornerRadius === 0 ? 'square' :
                                selectedElement.cornerRadius === 8 ? 'rounded' :
                                selectedElement.cornerRadius === 24 ? 'extra-rounded' :
                                selectedElement.cornerRadius >= Math.min(selectedElement.width, selectedElement.height) / 2 ? 'pill' : 'custom'
                              }
                              onChange={(e) => {
                                const val = e.target.value
                                const maxRadius = Math.min(selectedElement.width, selectedElement.height) / 2
                                if (val === 'square') updateElement(selectedElement.id, { cornerRadius: 0 })
                                if (val === 'rounded') updateElement(selectedElement.id, { cornerRadius: 8 })
                                if (val === 'extra-rounded') updateElement(selectedElement.id, { cornerRadius: 24 })
                                if (val === 'pill') updateElement(selectedElement.id, { cornerRadius: maxRadius })
                              }}
                            >
                              <option value="custom">Custom</option>
                              <option value="square">Square</option>
                              <option value="rounded">Rounded</option>
                              <option value="extra-rounded">Extra Rounded</option>
                              <option value="pill">Pill / Circle</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Corner Shape</label>
                            <select 
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                              value={selectedElement.cornerShape || 'round'}
                              onChange={(e) => updateElement(selectedElement.id, { cornerShape: e.target.value })}
                            >
                              <option value="round">Round</option>
                              <option value="bevel">Bevel</option>
                              <option value="notch">Notch</option>
                              <option value="scoop">Scoop</option>
                              <option value="squircle">Squircle</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {selectedElement.type === 'panel' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold">Fill Color</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={selectedElement.fill || '#ffffff'}
                                onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                                className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                        <p className="text-sm text-slate-400">
                          Select an element on the canvas to edit its properties.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Page Settings</h4>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={currentProject.settings?.width || 800}
                                  onChange={(e) => handleSettingsChange('width', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Height</label>
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={currentProject.settings?.height || 1200}
                                  onChange={(e) => handleSettingsChange('height', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-700/50">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Presets</p>
                            <div className="grid grid-cols-1 gap-1.5">
                              <PresetButton label="Standard Comic" size="800x1200" onClick={() => applyPreset(800, 1200)} />
                              <PresetButton label="Manga" size="600x900" onClick={() => applyPreset(600, 900)} />
                              <PresetButton label="Square" size="1000x1000" onClick={() => applyPreset(1000, 1000)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rightSidebarTab === 'assets' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto pr-2">
                    <AssetGallery 
                      imageIds={currentProject.assets?.imageIds || []} 
                      selectedAssetId={selectedAssetId}
                      onSelect={(id) => setSelectedAssetId(id)}
                      onAdd={(id) => addAssetToPage(id)}
                    />
                  </div>
                  
                  {selectedAssetId && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <AssetPropertiesWidget 
                        assetId={selectedAssetId} 
                        onAdd={(id) => addAssetToPage(id)}
                      />
                    </div>
                  )}
                </div>
              )}

              {rightSidebarTab === 'layers' && (
                <div className="space-y-2">
                  {currentPage?.elements?.slice().reverse().map((el, idx) => {
                    const reversedIdx = (currentPage.elements?.length || 0) - idx - 1
                    return (
                      <div 
                        key={el.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setData('elementId', el.id)
                          e.dataTransfer.setData('sourceIndex', reversedIdx.toString())
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'move'
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const sourceId = e.dataTransfer.getData('elementId')
                          const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'))
                          
                          if (sourceId && sourceId !== el.id) {
                            // Reorder by moving source element to target position
                            const elements = [...currentPage.elements]
                            const [removed] = elements.splice(sourceIndex, 1)
                            elements.splice(reversedIdx, 0, removed)
                            
                            updateCurrentProjectLocal({
                              pages: currentProject.pages.map((p, i) => 
                                i === activePageIndex ? { ...p, elements } : p
                              )
                            })
                          }
                        }}
                        onClick={() => setSelectedElementIds([el.id])}
                        className={`p-2 rounded-lg border flex items-center gap-3 cursor-move transition-all ${
                          selectedElementIds.includes(el.id) 
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                            : 'bg-slate-800/30 border-transparent hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {el.type === 'image' ? (
                              <AssetThumbnail assetId={el.assetId} />
                            ) : (
                              <span className="text-[10px] uppercase font-bold">{el.type.charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-xs font-medium truncate">
                            {el.type.charAt(0).toUpperCase() + el.type.slice(1)} {(currentPage.elements?.length || 0) - idx}
                          </span>
                        </div>
                        <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    )
                  })}
                  {(!currentPage?.elements || currentPage.elements.length === 0) && (
                    <p className="text-center text-slate-500 text-sm py-8">No elements on this page</p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}

function PropertyInput({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-slate-500 uppercase font-bold">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
      />
    </div>
  )
}

function PresetButton({ label, size, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="text-left px-3 py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-xs transition-colors flex justify-between items-center border border-slate-700/50"
    >
      <span className="font-medium">{label}</span>
      <span className="text-slate-500 font-mono">{size}</span>
    </button>
  )
}

function AssetGallery({ imageIds, selectedAssetId, onSelect, onAdd }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {imageIds.map(id => (
          <button 
            key={id}
            onClick={() => onSelect(id)}
            onDoubleClick={() => onAdd(id)}
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData('assetId', id)
              e.dataTransfer.effectAllowed = 'copy'
            }}
            className={`aspect-square bg-slate-800 rounded-lg border overflow-hidden transition-all group relative ${
              selectedAssetId === id 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                : 'border-slate-700 hover:border-slate-500'
            }`}
          >
            <AssetThumbnail assetId={id} />
            <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
      {imageIds.length === 0 && (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-800 rounded-xl">
          <p className="text-sm text-slate-500">No assets uploaded yet.</p>
        </div>
      )}
    </div>
  )
}

function AssetPropertiesWidget({ assetId, onAdd }) {
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadAsset = async () => {
      setLoading(true)
      try {
        const data = await db.images.get(assetId)
        if (isMounted) {
          setAsset(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load asset metadata:', error)
        if (isMounted) setLoading(false)
      }
    }
    loadAsset()
    return () => { isMounted = false }
  }, [assetId])

  if (loading) return <div className="animate-pulse h-32 bg-slate-800 rounded-lg" />
  if (!asset) return null

  const fileSize = (asset.size / 1024).toFixed(1) + ' KB'

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Asset Properties</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Name</span>
          <span className="text-xs text-slate-200 font-medium truncate max-w-[120px]" title={asset.name}>{asset.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Size</span>
          <span className="text-xs text-slate-200 font-medium">{fileSize}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Type</span>
          <span className="text-xs text-slate-200 font-medium uppercase">{asset.type.split('/')[1]}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Added</span>
          <span className="text-xs text-slate-200 font-medium">
            {new Date(asset.createdAt).toLocaleDateString()}
          </span>
        </div>

        <button 
          onClick={() => onAdd(assetId)}
          className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add to Canvas
        </button>
      </div>
    </div>
  )
}

function AssetThumbnail({ assetId }) {
  const image = useImage(assetId)
  
  if (!image) {
    return <div className="w-full h-full animate-pulse bg-slate-700" />
  }
  
  return (
    <img 
      src={image.src} 
      alt="Asset" 
      className="w-full h-full object-cover"
    />
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
      className={`w-full aspect-[3/4] rounded-lg border-2 transition-colors flex items-center justify-center ${
        isActive 
          ? 'border-indigo-500 bg-slate-800' 
          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
      }`}
    >
      <span className={`text-xs ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
        {pageNumber}
      </span>
    </button>
  )
}

function ToolButton({ icon, label, active = false, onClick }) {
  const icons = {
    pointer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
    square: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    type: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />,
  }

  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-lg transition-all ${
        active 
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
      title={label}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[icon]}
      </svg>
    </button>
  )
}


