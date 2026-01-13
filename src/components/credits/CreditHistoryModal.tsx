/**
 * Credit History Modal
 * Shows transaction history for user's credits
 */

import { useEffect } from 'react'
import { FiX, FiZap, FiPlus, FiMinus, FiImage, FiMessageSquare, FiRefreshCw, FiGift } from 'react-icons/fi'
import { useCredits } from '../../hooks/useCredits'
import { formatCredits, getTierDisplayName, getTierColorClass } from '../../lib/credits'

interface CreditHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const TRANSACTION_ICONS: Record<string, typeof FiZap> = {
  monthly_grant: FiGift,
  manual_grant: FiPlus,
  purchase: FiPlus,
  ai_image: FiImage,
  ai_story: FiMessageSquare,
  ai_enhance: FiZap,
  refund: FiRefreshCw,
  adjustment: FiZap,
}

const TRANSACTION_LABELS: Record<string, string> = {
  monthly_grant: 'Monthly Credits',
  manual_grant: 'Credits Added',
  purchase: 'Credits Purchased',
  ai_image: 'Image Generation',
  ai_story: 'Story AI Chat',
  ai_enhance: 'Prompt Enhancement',
  refund: 'Refund',
  adjustment: 'Adjustment',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

export default function CreditHistoryModal({ isOpen, onClose }: CreditHistoryModalProps) {
  const { credits, history, isLoadingHistory, fetchHistory } = useCredits()

  // Fetch history when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, fetchHistory])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl
                      max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiZap className="w-5 h-5 text-amber-400" />
            Credit History
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50
                       rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Summary */}
        {credits && (
          <div className="px-5 py-4 bg-slate-800/30 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{credits.balance}</span>
                  <span className="text-sm text-slate-400">credits</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold uppercase ${getTierColorClass(credits.tier)}`}>
                    {getTierDisplayName(credits.tier)}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    {credits.monthlyAllocation}/month
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Next reset in</div>
                <div className="text-sm font-medium text-white">
                  {credits.daysUntilReset} days
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-slate-400">
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading history...</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <FiZap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No transactions yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Your credit usage will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((transaction) => {
                const Icon = TRANSACTION_ICONS[transaction.transactionType] || FiZap
                const isPositive = transaction.amount > 0

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${
                      isPositive ? 'bg-green-900/30' : 'bg-slate-700/50'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isPositive ? 'text-green-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">
                        {TRANSACTION_LABELS[transaction.transactionType] || transaction.transactionType}
                      </div>
                      {transaction.description && (
                        <div className="text-xs text-slate-500 truncate">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? '+' : ''}{transaction.amount}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
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
