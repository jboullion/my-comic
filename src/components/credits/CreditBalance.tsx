/**
 * Credit Balance Display Component
 * Shows the user's current credit balance in a compact format
 */

import { FiZap, FiRefreshCw } from 'react-icons/fi'
import { useCredits } from '../../hooks/useCredits'
import { getTierDisplayName, getTierColorClass } from '../../lib/credits'

interface CreditBalanceProps {
  /** Show as a compact pill (for header) or expanded (for profile) */
  variant?: 'compact' | 'expanded'
  /** Optional click handler to show history */
  onClick?: () => void
  /** Show refresh button */
  showRefresh?: boolean
}

export default function CreditBalance({
  variant = 'compact',
  onClick,
  showRefresh = false,
}: CreditBalanceProps) {
  const { balance, tier, isLoading, isLoggedIn, refresh } = useCredits()

  // Don't show anything if not logged in
  if (!isLoggedIn) {
    return null
  }

  // Loading state
  if (isLoading && balance === null) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-lg animate-pulse">
        <FiZap className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs text-slate-500">...</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 hover:bg-slate-700/50
                   rounded-lg transition-colors group"
        title="Click to view credit history"
      >
        <FiZap className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
        <span className="text-sm font-medium text-white">
          {balance ?? 0}
        </span>
        {tier && tier !== 'free' && (
          <span className={`text-[10px] font-bold uppercase ${getTierColorClass(tier)}`}>
            {getTierDisplayName(tier)}
          </span>
        )}
      </button>
    )
  }

  // Expanded variant for profile page
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FiZap className="w-4 h-4 text-amber-400" />
          AI Credits
        </h3>
        {showRefresh && (
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50
                       rounded-lg transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-white">{balance ?? 0}</span>
        <span className="text-sm text-slate-400">credits remaining</span>
      </div>

      {tier && (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase ${getTierColorClass(tier)}`}>
            {getTierDisplayName(tier)} Plan
          </span>
        </div>
      )}

      {onClick && (
        <button
          onClick={onClick}
          className="mt-3 w-full text-xs text-indigo-400 hover:text-indigo-300
                     transition-colors text-left"
        >
          View transaction history →
        </button>
      )}
    </div>
  )
}
