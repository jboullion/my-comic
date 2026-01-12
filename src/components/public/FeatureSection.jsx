import { Link } from 'react-router-dom'
import { FiImage, FiArrowRight } from 'react-icons/fi'

/**
 * FeatureSection
 *
 * Two-column section component with image and content for home page features.
 * Supports alternating image positions and optional CTA links.
 */
export default function FeatureSection({
  title,
  description,
  imagePosition = 'left',
  imagePlaceholder = true,
  ctaLink,
  children
}) {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image placeholder */}
          <div className={imagePosition === 'right' ? 'lg:order-2' : ''}>
            {imagePlaceholder ? (
              <div className="aspect-video bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                <FiImage className="w-12 h-12 text-slate-600 mb-2" />
                <span className="text-slate-500 text-sm">Screenshot placeholder</span>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Content */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
            {description && (
              <p className="text-lg text-slate-400 mb-6">{description}</p>
            )}
            {!imagePlaceholder && children}
            {ctaLink && (
              <Link
                to={ctaLink.to}
                className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-2 mt-4 transition-colors"
              >
                {ctaLink.text}
                <FiArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
