import { FiCheck } from 'react-icons/fi'

/**
 * PricingCard
 *
 * Reusable card component for displaying pricing tiers.
 * Supports highlighted, disabled states and optional badges.
 */
export default function PricingCard({
  name,
  price,
  priceSubtext,
  badge,
  description,
  features = [],
  ctaText,
  onCtaClick,
  highlighted = false,
  disabled = false
}) {
  // Build card classes dynamically
  const cardClasses = [
    'p-6 bg-slate-800/50 rounded-xl border border-slate-700 transition-all',
    highlighted && 'ring-2 ring-indigo-500/50',
    !disabled && 'hover:border-indigo-500/50',
    disabled && 'opacity-50 pointer-events-none'
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses}>
      {/* Badge if provided */}
      {badge && (
        <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase rounded mb-4">
          {badge}
        </span>
      )}

      {/* Price section */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="text-4xl font-bold mb-1">{price}</div>
        {priceSubtext && (
          <p className="text-slate-400 text-sm mb-3">{priceSubtext}</p>
        )}
        <p className="text-slate-400">{description}</p>
      </div>

      {/* Features list with checkmarks */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
            <FiCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      {ctaText && (
        <button
          onClick={onCtaClick}
          disabled={disabled}
          className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 rounded-lg font-medium transition-colors"
        >
          {ctaText}
        </button>
      )}
    </div>
  )
}
