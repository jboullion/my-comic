import { FiEdit2, FiMessageCircle, FiZap, FiLayers, FiDownload, FiUser } from 'react-icons/fi'

const features = [
  {
    icon: FiEdit2,
    title: 'Canvas Editor',
    description: 'Drag, resize, and rotate elements with full creative control over your comic panels.'
  },
  {
    icon: FiMessageCircle,
    title: 'Speech Bubbles',
    description: 'Round and cloud styles with inline text editing. Just click and type.'
  },
  {
    icon: FiZap,
    title: 'Text Effects',
    description: 'Add POW!, BAM!, BOOM! and other comic-style effects with customizable colors.'
  },
  {
    icon: FiLayers,
    title: 'Multi-Page Projects',
    description: 'Organize your comics with multiple pages and easy navigation.'
  },
  {
    icon: FiDownload,
    title: 'Export to ZIP',
    description: 'Export all pages as WebP, PNG, or JPEG. Ready for print or web.'
  },
  {
    icon: FiUser,
    title: 'Free Account',
    description: 'Sign in with Google or Discord. No tracking—just your projects, ready for cloud sync.'
  }
]

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-colors">
      <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

export default function Features() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
          Everything You Need to Create Comics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
