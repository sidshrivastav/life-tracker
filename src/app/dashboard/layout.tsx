'use client'

import { useAuth } from '../../hooks/useAuth'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Life Tracker</h1>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="hidden md:flex space-x-8">
                  <a href="/dashboard" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/dashboard/food" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                    Food
                  </a>
                  <a href="/dashboard/calorie" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                    Calories
                  </a>
                </div>
                
                {/* User menu */}
                <div className="flex items-center space-x-4">
                  {user && (
                    <span className="text-sm text-gray-600">
                      {user.email}
                    </span>
                  )}
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
    </ProtectedRoute>
  )
}