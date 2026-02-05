import { Link } from 'react-router-dom'
import { FiImage, FiMessageSquare, FiSmartphone } from 'react-icons/fi'
import PublicLayout from '../layouts/PublicLayout'
import FeatureSection from '../components/public/FeatureSection'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Amazing Comics
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            A powerful, free comic book editor that works entirely in your browser.
            Create professional comics with.
          </p>
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
