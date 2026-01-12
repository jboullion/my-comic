import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Development mode bypass - mock user for local testing
const DEV_MODE_BYPASS = import.meta.env.VITE_SKIP_AUTH === 'true'
const MOCK_USER = {
  id: 'dev-user-mock-id',
  email: 'dev@localhost',
  user_metadata: {
    full_name: 'Dev User',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Development mode bypass - skip auth entirely
    if (DEV_MODE_BYPASS) {
      console.log('🔓 Auth bypass enabled - using mock user for development')
      setUser(MOCK_USER)
      setSession({ user: MOCK_USER, access_token: 'dev-token' })
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in with OAuth provider (Google or Discord)
  const signInWithProvider = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signInWithGoogle = () => signInWithProvider('google')
  const signInWithDiscord = () => signInWithProvider('discord')

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
