import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PublicLayout from '../layouts/PublicLayout'
import { useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FaDiscord } from 'react-icons/fa'

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithDiscord } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  const handleDiscordLogin = async () => {
    try {
      await signInWithDiscord()
    } catch (error) {
      console.error('Discord login error:', error)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
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
            <p className="text-center text-sm text-slate-500">
              By signing in, you agree to our{' '}
              <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-300 mb-2">
            Why sign in?
          </h3>
          <ul className="text-sm text-slate-500 space-y-1">
            <li>• Sync projects across devices (coming soon)</li>
            <li>• Share comics with the community (coming soon)</li>
            <li>• Access premium features (coming soon)</li>
          </ul>
        </div>
      </div>
    </PublicLayout>
  )
}
