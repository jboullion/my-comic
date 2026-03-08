import PublicLayout from '../layouts/PublicLayout'
import Features from '../components/public/Features'

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

      <Features />
    </PublicLayout>
  )
}
