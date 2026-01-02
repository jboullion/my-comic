import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../layouts/AppLayout'

export default function ProjectPage() {
  const { projectId } = useParams()
  const { user } = useAuth()

  // TODO: Fetch project from Supabase/IndexedDB
  const project = {
    id: projectId,
    title: 'My First Comic',
    pages: []
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Project Header */}
        <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-medium">{project.title}</h1>
              <p className="text-sm text-slate-500">Project ID: {projectId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              Settings
            </button>
            <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Page Thumbnails */}
          <aside className="w-48 border-r border-slate-800 p-3 overflow-y-auto bg-slate-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase">Pages</span>
              <button className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            {/* Page Thumbnails */}
            <div className="space-y-2">
              <PageThumbnail pageNumber={1} isActive={true} />
              <PageThumbnail pageNumber={2} isActive={false} />
              <PageThumbnail pageNumber={3} isActive={false} />
            </div>
          </aside>

          {/* Main Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-slate-950/50">
            <div className="text-center">
              <div className="w-96 h-[500px] bg-white rounded-lg shadow-2xl flex items-center justify-center mb-4">
                <div className="text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Canvas workspace</p>
                  <p className="text-xs text-slate-500 mt-1">Konva.js integration coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          <aside className="w-64 border-l border-slate-800 p-4 overflow-y-auto bg-slate-900/30">
            <h3 className="text-xs font-medium text-slate-400 uppercase mb-4">Properties</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
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
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}

function PageThumbnail({ pageNumber, isActive }) {
  return (
    <button
      className={`w-full aspect-[3/4] rounded-lg border-2 transition-colors ${
        isActive 
          ? 'border-indigo-500 bg-slate-800' 
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
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
