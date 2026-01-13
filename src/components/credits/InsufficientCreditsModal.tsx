/**
 * Insufficient Credits Modal
 * Shown when user tries to use AI features without enough credits
 */

import { FiZap, FiClock, FiArrowRight, FiX } from 'react-icons/fi'
import { useCredits } from '../../hooks/useCredits'
import { getTierDisplayName } from '../../lib/credits'

interface InsufficientCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  requiredCredits: number
  actionName?: string
}

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  requiredCredits,
  actionName = 'This action',
}: InsufficientCreditsModalProps) {
  const { balance, credits } = useCredits()

  if (!isOpen) return null

  const needed = requiredCredits - (balance ?? 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl
                      max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiZap className="w-5 h-5 text-amber-400" />
            Insufficient Credits
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50
                       rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <p className="text-slate-300 mb-4">
            {actionName} requires <span className="font-bold text-white">{requiredCredits}</span> credits,
            but you only have <span className="font-bold text-white">{balance ?? 0}</span>.
          </p>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Your balance</span>
              <span className="text-lg font-bold text-white">{balance ?? 0}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Required</span>
              <span className="text-lg font-bold text-red-400">-{requiredCredits}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
              <span className="text-sm text-slate-400">Shortfall</span>
              <span className="text-lg font-bold text-red-400">{needed} credits</span>
            </div>
          </div>

          {/* Reset info */}
          {credits?.daysUntilReset !== undefined && (
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <FiClock className="w-4 h-4" />
              <span>
                Monthly reset in <span className="text-white font-medium">{credits.daysUntilReset}</span> days
                ({credits.monthlyAllocation} credits)
              </span>
            </div>
          )}

          {/* Upgrade CTA */}
          {credits?.tier === 'free' && (
            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-300 mb-1">
                Need more credits?
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Upgrade to {getTierDisplayName('hobbyist')} for 100 credits/month
              </p>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2
                           bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                           rounded-lg transition-colors"
                onClick={() => {
                  // TODO: Navigate to pricing page
                  onClose()
                }}
              >
                Upgrade Plan
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-800/30 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white
                       text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
