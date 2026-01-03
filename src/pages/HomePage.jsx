import { Link } from 'react-router-dom'
import { FiImage, FiMessageSquare, FiSmartphone } from 'react-icons/fi'
import PublicLayout from '../layouts/PublicLayout'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Amazing Comics
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            A powerful, free comic book editor that works entirely in your browser. 
            No account required. Your data stays on your device.
          </p>
          <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-indigo-500/25">
            Start Creating
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon={<FiImage className="w-6 h-6" />}
            title="Drag & Drop Editor"
            description="Intuitive panel layout with drag-and-drop support. Add images, resize, and arrange with ease."
          />
          <FeatureCard 
            icon={<FiMessageSquare className="w-6 h-6" />}
            title="Speech Bubbles & Text"
            description="Professional speech bubbles, thought clouds, captions, and sound effects with custom styling."
          />
          <FeatureCard 
            icon={<FiSmartphone className="w-6 h-6" />}
            title="Works Offline"
            description="Install as an app and work offline. Your projects are saved locally and always accessible."
          />
        </div>

        {/* Status Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            PWA Ready • React + Vite • Tailwind CSS
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
      <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}
