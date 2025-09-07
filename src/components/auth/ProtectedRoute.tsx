'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  fallback, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're initialized and there's no user
    if (initialized && !loading && !user) {
      console.log('🔍 ProtectedRoute: No authenticated user, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [initialized, loading, user, router, redirectTo])

  // Show loading while checking authentication
  if (!initialized || loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      )
    )
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null
  }

  // User is authenticated, render children
  return <>{children}</>
}