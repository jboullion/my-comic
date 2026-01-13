/**
 * Credit Cost Preview Component
 * Shows the cost of an action and whether user can afford it
 */

import { FiZap, FiAlertCircle } from 'react-icons/fi'
import { useCreditCost } from '../../hooks/useCredits'

interface CreditCostPreviewProps {
  /** The cost of the action in credits */
  cost: number
  /** Optional label for the action */
  actionLabel?: string
  /** Whether to show in a compact inline format */
  inline?: boolean
}

export default function CreditCostPreview({
  cost,
  actionLabel,
  inline = false,
}: CreditCostPreviewProps) {
  const { canAfford, balance, remainingAfter } = useCreditCost(cost)

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${
        canAfford ? 'text-slate-400' : 'text-red-400'
      }`}>
        <FiZap className="w-3 h-3" />
        {cost} {cost === 1 ? 'credit' : 'credits'}
        {!canAfford && <FiAlertCircle className="w-3 h-3" />}
      </span>
    )
  }

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
      canAfford
        ? 'bg-slate-800/50 border border-slate-700/50'
        : 'bg-red-900/20 border border-red-700/50'
    }`}>
      <div className="flex items-center gap-2">
        <FiZap className={`w-4 h-4 ${canAfford ? 'text-amber-400' : 'text-red-400'}`} />
        <div>
          <div className="text-sm text-white">
            {actionLabel || 'This action'} costs <span className="font-bold">{cost}</span> {cost === 1 ? 'credit' : 'credits'}
          </div>
          {balance !== null && (
            <div className="text-xs text-slate-400">
              {canAfford ? (
                <>You'll have {remainingAfter} remaining</>
              ) : (
                <>You need {cost - balance} more credits</>
              )}
            </div>
          )}
        </div>
      </div>

      {!canAfford && (
        <div className="flex items-center gap-1 text-red-400">
          <FiAlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Insufficient</span>
        </div>
      )}
    </div>
  )
}
