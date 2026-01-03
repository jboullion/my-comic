import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Test page for File System Access API
 * Demonstrates save/open flow for .cbproject files with Firefox fallback
 */
export default function FileApiTest() {
  const [projectData, setProjectData] = useState({
    title: 'My First Comic',
    author: 'Test User',
    created: new Date().toISOString(),
    pages: [
      { id: 1, panels: [{ id: 1, x: 0, y: 0, width: 300, height: 200 }] },
      { id: 2, panels: [] }
    ]
  })
  const [fileHandle, setFileHandle] = useState(null)
  const [status, setStatus] = useState('')
  const supportsFileApi = 'showSaveFilePicker' in window

  // ============ SAVE FUNCTIONALITY ============

  // Modern browsers (Chrome, Edge, Safari 15.4+)
  const saveWithFileSystemApi = async () => {
    try {
      const options = {
        suggestedName: `${projectData.title}.cbproject`,
        types: [{
          description: 'Comic Book Project',
          accept: { 'application/json': ['.cbproject'] }
        }]
      }

      // If we have an existing handle, try to write to it
      // Otherwise, show the save picker
      let handle = fileHandle
      if (!handle) {
        handle = await window.showSaveFilePicker(options)
        setFileHandle(handle) // Remember for future "Save" (not "Save As")
      }

      const writable = await handle.createWritable()
      const json = JSON.stringify(projectData, null, 2)
      await writable.write(json)
      await writable.close()

      setStatus(`✅ Saved to: ${handle.name}`)
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('⚠️ Save cancelled by user')
      } else {
        setStatus(`❌ Save failed: ${err.message}`)
      }
    }
  }

  // "Save As" - always show picker
  const saveAsWithFileSystemApi = async () => {
    setFileHandle(null) // Clear handle to force picker
    await saveWithFileSystemApi()
  }

  // Fallback for Firefox (download approach)
  const saveWithDownload = () => {
    const json = JSON.stringify(projectData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectData.title}.cbproject`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setStatus('✅ Downloaded file (Firefox fallback)')
  }

  // ============ OPEN FUNCTIONALITY ============

  // Modern browsers
  const openWithFileSystemApi = async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Comic Book Project',
          accept: { 'application/json': ['.cbproject'] }
        }],
        multiple: false
      })

      const file = await handle.getFile()
      const contents = await file.text()
      const data = JSON.parse(contents)

      setProjectData(data)
      setFileHandle(handle) // Remember for future saves
      setStatus(`✅ Opened: ${handle.name}`)
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('⚠️ Open cancelled by user')
      } else {
        setStatus(`❌ Open failed: ${err.message}`)
      }
    }
  }

  // Fallback for Firefox (file input approach)
  const openWithFileInput = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        setProjectData(data)
        setStatus(`✅ Opened: ${file.name} (Firefox fallback)`)
      } catch (err) {
        setStatus(`❌ Parse failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  // ============ UI ============

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">File System Access API Test</h1>
        <p className="text-slate-400 mb-8">
          Test the save/open flow for .cbproject files
        </p>

        {/* API Support Status */}
        <div className={`p-4 rounded-lg mb-8 ${supportsFileApi ? 'bg-green-900/30 border border-green-700' : 'bg-yellow-900/30 border border-yellow-700'}`}>
          <div className="font-medium">
            {supportsFileApi ? '✅ File System Access API Supported' : '⚠️ File System Access API Not Supported'}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {supportsFileApi 
              ? 'Your browser supports modern file access. You\'ll get native save/open dialogs.'
              : 'Using fallback mode (download/upload). This is normal for Firefox.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Save Project</h2>
            
            {supportsFileApi ? (
              <>
                <button
                  onClick={saveWithFileSystemApi}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  💾 Save {fileHandle ? `(to ${fileHandle.name})` : ''}
                </button>
                <button
                  onClick={saveAsWithFileSystemApi}
                  className="w-full px-4 py-3 bg-indigo-600/50 hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  💾 Save As...
                </button>
              </>
            ) : (
              <button
                onClick={saveWithDownload}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                ⬇️ Download .cbproject
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Open Project</h2>
            
            {supportsFileApi ? (
              <button
                onClick={openWithFileSystemApi}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                📂 Open File...
              </button>
            ) : (
              <label className="block w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-center cursor-pointer">
                📂 Choose File...
                <input
                  type="file"
                  accept=".cbproject,application/json"
                  onChange={openWithFileInput}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className="p-4 bg-slate-800 rounded-lg mb-8 font-mono text-sm">
            {status}
          </div>
        )}

        {/* Project Data Editor */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Project Data (editable)</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={projectData.title}
                onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Author</label>
              <input
                type="text"
                value={projectData.author}
                onChange={(e) => setProjectData({ ...projectData, author: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Raw JSON (read-only preview)
            </label>
            <pre className="p-4 bg-slate-950 rounded-lg text-xs overflow-auto max-h-64 text-slate-300">
              {JSON.stringify(projectData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="font-semibold mb-2">🧪 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-sm">
            <li>Edit the title or author above</li>
            <li>Click "Save" or "Save As..." to save a .cbproject file</li>
            <li>Refresh the page (data resets to default)</li>
            <li>Click "Open File..." and select your saved file</li>
            <li>Verify your edits are restored</li>
            <li>Try in Firefox to see the fallback behavior</li>
          </ol>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
