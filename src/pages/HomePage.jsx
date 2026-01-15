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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/app" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-indigo-500/25">
              Start Creating
            </Link>
            <Link to="/pricing" className="px-8 py-4 border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 rounded-xl text-lg font-semibold transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Create Comics Section */}
      <FeatureSection
        title="Create Comics Like a Pro"
        description="Professional drag-and-drop editor with everything you need to bring your stories to life."
        imagePosition="left"
      >
        <ul className="space-y-2 text-slate-400 mb-6">
          <li>• Intuitive panel-based layout</li>
          <li>• Professional speech bubbles and text effects</li>
          <li>• Multi-page project management</li>
          <li>• Export to multiple formats (WebP, PNG, JPEG)</li>
        </ul>
      </FeatureSection>

      {/* Save Locally Section */}
      <FeatureSection
        title="Your Data, Your Device"
        description="Privacy-first, offline-capable architecture. Your creative work stays on your device—no backend storage."
        imagePosition="right"
      >
        <ul className="space-y-2 text-slate-400 mb-6">
          <li>• Export anytime for backup</li>
          <li>• You own your creations</li>
        </ul>
      </FeatureSection>

      {/* AI Features Section */}
      <FeatureSection
        title="AI-Powered Image Generation"
        description="Create stunning comic art with state-of-the-art AI models. Generate character-consistent images with FLUX Pro and custom LoRA support."
        imagePosition="left"
        ctaLink={{ text: 'View AI Features →', to: '/docs/ai-image-generation' }}
      >
        <ul className="space-y-2 text-slate-400 mb-6">
          <li>• FLUX 2 Pro, Dev, and NanoBanana models</li>
          <li>• In Painting</li>
          <li>• Comic, Manga, Realistic, and Retro styles</li>

        </ul>
      </FeatureSection>

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
