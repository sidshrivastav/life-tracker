'use client'

import { createClient } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const checkAuthorization = (userEmail: string | undefined) => {
    const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
    if (!authorizedEmail || !userEmail) {
      return false
    }
    return userEmail.toLowerCase() === authorizedEmail.toLowerCase()
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Check if user is authorized
      const isAuthorized = checkAuthorization(user.email)
      if (!isAuthorized) {
        await supabase.auth.signOut()
        router.push('/error?message=unauthorized')
        return
      }
      
      setUser(user)
      setAuthorized(true)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login')
        } else {
          const isAuthorized = checkAuthorization(session.user.email)
          if (!isAuthorized) {
            supabase.auth.signOut()
            router.push('/error?message=unauthorized')
            return
          }
          setUser(session.user)
          setAuthorized(true)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || !authorized) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Empty space for logo/branding if needed later */}
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-8">
                <a href="/dashboard" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </a>
              </div>
              
              {/* User menu */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSignOut}
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}