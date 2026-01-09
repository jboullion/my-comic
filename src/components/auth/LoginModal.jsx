import { FiX } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaDiscord } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'

/**
 * LoginModal Component
 * Modal for signing in with Google or Discord
 */
export default function LoginModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithDiscord } = useAuth()

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  const handleDiscordLogin = async () => {
    try {
      await signInWithDiscord()
      onClose()
    } catch (error) {
      console.error('Discord login error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Sign In</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors"
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </button>

            {/* Discord Sign In */}
            <button
              onClick={handleDiscordLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors"
            >
              <FaDiscord className="w-5 h-5" />
              Continue with Discord
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-xs text-slate-500">
              By signing in, you agree to our{' '}
              <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
