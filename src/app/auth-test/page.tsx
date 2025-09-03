'use client'

import { createClient } from '../../../utils/supabase/client'
import { useEffect, useState } from 'react'

export default function AuthTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      {user ? (
        <div>
          <p className="text-green-600">✅ User is authenticated</p>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="text-red-600">❌ User is not authenticated</p>
          <a href="/login" className="text-blue-600 underline">Go to Login</a>
        </div>
      )}
    </div>
  )
}