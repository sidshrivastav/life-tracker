'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

interface AuthHook extends AuthState {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<{ user: User | null; session: Session | null }>
}

export function useAuth(): AuthHook {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 useAuth: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ useAuth: Error getting session:', error)
        } else {
          console.log('✅ useAuth: Initial session retrieved:', { 
            hasSession: !!session, 
            userEmail: session?.user?.email 
          })
        }

        if (isMounted) {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            initialized: true
          })
        }
      } catch (error) {
        console.error('❌ useAuth: Exception getting session:', error)
        if (isMounted) {
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            initialized: true 
          }))
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 useAuth: Auth state changed:', { 
          event, 
          hasSession: !!session,
          userEmail: session?.user?.email 
        })

        if (isMounted) {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            initialized: true
          })
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('🔍 useAuth: User signed out, redirecting to login')
          router.push('/login')
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 useAuth: Starting Google sign-in...')
      
      // Force production domain to avoid preview URL mismatches
      const getBaseUrl = () => {
        const productionUrl = 'https://life-tracker-delta-khaki.vercel.app'
        
        // Only use NEXT_PUBLIC_SITE_URL if it matches production domain
        if (process.env.NEXT_PUBLIC_SITE_URL && 
            process.env.NEXT_PUBLIC_SITE_URL === productionUrl) {
          return process.env.NEXT_PUBLIC_SITE_URL
        }
        
        // Always use production domain
        return productionUrl
      }

      const baseUrl = getBaseUrl()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback?redirect_to=/dashboard`
        }
      })

      if (error) {
        console.error('❌ useAuth: Google sign-in error:', error)
        throw error
      }

      console.log('✅ useAuth: Google sign-in initiated successfully')
    } catch (error) {
      console.error('❌ useAuth: Google sign-in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('🔍 useAuth: Signing out...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ useAuth: Sign out error:', error)
        throw error
      }

      console.log('✅ useAuth: Signed out successfully')
    } catch (error) {
      console.error('❌ useAuth: Sign out failed:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      console.log('🔍 useAuth: Refreshing session...')
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ useAuth: Session refresh error:', error)
        throw error
      }

      console.log('✅ useAuth: Session refreshed successfully')
      return {
        user: data.user,
        session: data.session
      }
    } catch (error) {
      console.error('❌ useAuth: Session refresh failed:', error)
      throw error
    }
  }

  return {
    ...authState,
    signInWithGoogle,
    signOut,
    refreshSession
  }
}