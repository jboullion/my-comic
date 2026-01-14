/**
 * Delete Account Modal
 * Confirmation modal for permanently deleting a user's account
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi'
import { deleteAccountViaEdge } from '../../lib/ai/edgeFunctions'
import { db } from '../../lib/db'
import { useAuth } from '../../contexts/AuthContext'
import { useCreditsStore } from '../../stores/useCreditsStore'

const CONFIRMATION_TEXT = 'DELETE'

export default function DeleteAccountModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const clearCredits = useCreditsStore(state => state.clearCredits)

  const [confirmText, setConfirmText] = useState('')
  const [clearLocalData, setClearLocalData] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const isConfirmed = confirmText === CONFIRMATION_TEXT

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      // Delete account on server (cascades to all user data)
      await deleteAccountViaEdge()

      // Clear local data if requested
      if (clearLocalData) {
        try {
          await db.delete()
          console.log('[DeleteAccount] Local IndexedDB cleared')
        } catch (dbError) {
          console.warn('[DeleteAccount] Failed to clear IndexedDB:', dbError)
          // Continue even if local clear fails
        }
      }

      // Clear Zustand stores
      clearCredits()

      // Sign out
      await signOut()

      // Navigate to home
      navigate('/')
    } catch (err) {
      console.error('[DeleteAccount] Error:', err)
      setError(err.message || 'Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (isDeleting) return
    setConfirmText('')
    setClearLocalData(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-red-900/50 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-900/30 bg-red-950/20">
          <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5" />
            Delete Account
          </h2>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <p className="text-slate-300 mb-4">
            This action is <span className="font-bold text-red-400">permanent</span> and cannot be undone.
          </p>

          {/* What gets deleted */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">This will permanently delete:</h3>
            <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
              <li>Your account and profile</li>
              <li>Your credit balance</li>
            </ul>
          </div>

          {/* Local data checkbox */}
          <label className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 mb-4 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              checked={clearLocalData}
              onChange={(e) => setClearLocalData(e.target.checked)}
              disabled={isDeleting}
              className="mt-1.5 w-4 h-4 shrink-0 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <div>
              <span className="text-sm font-medium text-white">Also clear local browser data</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Delete all projects, images, series, and characters stored in this browser.
                This data is stored locally and not on our servers.
              </p>
            </div>
          </label>

          {/* Confirmation input */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">
              Type <span className="font-mono font-bold text-red-400">{CONFIRMATION_TEXT}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              disabled={isDeleting}
              placeholder={CONFIRMATION_TEXT}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 disabled:opacity-50"
              autoComplete="off"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg mb-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-800/30 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-red-400/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
