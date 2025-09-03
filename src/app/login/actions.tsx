'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Check if email is authorized before attempting login
  const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
  if (!authorizedEmail || data.email.toLowerCase() !== authorizedEmail.toLowerCase()) {
    redirect('/error?message=unauthorized')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/error?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Check if email is authorized before attempting signup
  const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
  if (!authorizedEmail || data.email.toLowerCase() !== authorizedEmail.toLowerCase()) {
    redirect('/error?message=unauthorized')
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect(`/error?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  console.log('🚀 signInWithGoogle function called!')
  
  try {
    const supabase = await createClient()
    console.log('✅ Supabase client created successfully')

  // Determine the correct redirect URL based on environment
  const getBaseUrl = () => {
    // In production, prioritize VERCEL_URL over potentially stale NEXT_PUBLIC_SITE_URL
    if (process.env.NODE_ENV === 'production') {
      // Check for Vercel-specific environment variables first
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.trim()}`
      }
      if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}`
      }
      // Only use NEXT_PUBLIC_SITE_URL in production if it's not localhost
      if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
        return process.env.NEXT_PUBLIC_SITE_URL.trim()
      }
      // Fallback - your actual Vercel domain
      return 'https://life-tracker-delta-khaki.vercel.app'
    }
    
    // Development environment
    return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').trim()
  }

  const baseUrl = getBaseUrl().trim()
  
  // Debug logging to help troubleshoot
  console.log('OAuth Redirect Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    baseUrl,
    redirectTo: `${baseUrl}/auth/callback?redirect_to=/dashboard`
  })

    console.log('🔍 About to call signInWithOAuth with:', {
      provider: 'google',
      redirectTo: `${baseUrl}/auth/callback?redirect_to=/dashboard`
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback?redirect_to=/dashboard`
      }
    })

    console.log('🔍 signInWithOAuth result:', { 
      success: !!data?.url, 
      error: error?.message,
      redirectUrl: data?.url 
    })

    if (error) {
      console.error('❌ OAuth error:', error)
      redirect(`/error?error=${encodeURIComponent(error.message)}`)
      return
    }

    if (data.url) {
      console.log('✅ Redirecting to OAuth URL')
      redirect(data.url)
    } else {
      console.error('❌ No OAuth URL returned')
      redirect('/error?error=no_oauth_url')
    }
  } catch (catchError) {
    console.error('❌ signInWithGoogle crashed:', catchError)
    redirect(`/error?error=${encodeURIComponent('OAuth initialization failed')}`)
  }
}
