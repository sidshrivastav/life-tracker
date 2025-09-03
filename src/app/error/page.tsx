'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>('An unexpected error occurred')

  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const errorDescription = searchParams.get('error_description')
    
    if (message === 'unauthorized') {
      setErrorMessage('Access denied. You are not authorized to use this application.')
      return
    }
    
    if (error) {
      switch (error) {
        case 'access_denied':
          setErrorMessage('Access was denied. Please try again.')
          break
        case 'invalid_request':
          setErrorMessage('Invalid authentication request.')
          break
        case 'unauthorized_client':
          setErrorMessage('Authentication failed. Please contact support.')
          break
        case 'unsupported_response_type':
          setErrorMessage('Authentication method not supported.')
          break
        case 'invalid_scope':
          setErrorMessage('Invalid authentication scope.')
          break
        case 'server_error':
          setErrorMessage('Server error occurred. Please try again later.')
          break
        case 'temporarily_unavailable':
          setErrorMessage('Service temporarily unavailable. Please try again later.')
          break
        case 'no_user_data':
          setErrorMessage('Authentication completed but no user data was received. Please try again.')
          break
        case 'no_oauth_url':
          setErrorMessage('OAuth initialization succeeded but no redirect URL was provided. Please try again.')
          break
        default:
          setErrorMessage(errorDescription || 'Authentication failed. Please try again.')
      }
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
        </div>
        
        <div className="mt-6">
          <a
            href="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
