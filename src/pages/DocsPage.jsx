import { Link } from 'react-router-dom'
import DocsLayout from '../layouts/DocsLayout'

export default function DocsPage() {
  return (
    <DocsLayout>
      <h1 className="text-4xl font-bold mb-4">Documentation</h1>
      <p className="text-lg text-slate-400 mb-8">
        Learn how to create amazing comics with Comic Book Maker.
      </p>

      {/* Quick Links Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <DocCard
          title="Getting Started"
          description="Create your first comic in under 5 minutes"
          icon="🚀"
          to="/docs"
        />
        <DocCard
          title="Panel Layouts"
          description="Learn about flexible panel arrangements"
          icon="📐"
          to="/docs/panels"
        />
        <DocCard
          title="Adding Images"
          description="Upload, resize, and position your artwork"
          icon="🖼️"
          to="/docs/images"
        />
        <DocCard
          title="Text & Bubbles"
          description="Add speech bubbles, captions, and effects"
          icon="💬"
          to="/docs/text"
        />
        <DocCard
          title="Saving Projects"
          description="Auto-save, export, and backup your work"
          icon="💾"
          to="/docs/saving"
        />
        <DocCard
          title="Keyboard Shortcuts"
          description="Speed up your workflow with hotkeys"
          icon="⌨️"
          to="/docs/shortcuts"
        />
      </div>

      {/* Placeholder Notice */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400 text-sm">
          🚧 Documentation is under construction. Check back after the editor is complete.
        </p>
      </div>
    </DocsLayout>
  )
}

function DocCard({ title, description, icon, to }) {
  return (
    <Link 
      to={to}
      className="block p-5 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  )
}
