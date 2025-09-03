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
  const supabase = await createClient()

  // Determine the correct redirect URL based on environment
  const getBaseUrl = () => {
    // If NEXT_PUBLIC_SITE_URL is set and not localhost in production, use it
    if (process.env.NEXT_PUBLIC_SITE_URL && 
        !(process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // For Vercel deployments - check multiple Vercel environment variables
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    }
    
    // For other production environments
    if (process.env.NODE_ENV === 'production') {
      console.warn('No production URL detected. Please set NEXT_PUBLIC_SITE_URL environment variable.')
      return 'https://your-production-domain.com'
    }
    
    // Development fallback
    return 'http://localhost:3000'
  }

  const baseUrl = getBaseUrl()
  
  // Debug logging to help troubleshoot
  console.log('OAuth Redirect Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    baseUrl,
    redirectTo: `${baseUrl}/auth/callback?redirect_to=/dashboard`
  })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback?redirect_to=/dashboard`
    }
  })

  if (error) {
    redirect(`/error?error=${encodeURIComponent(error.message)}`)
    return
  }

  if (data.url) {
    redirect(data.url)
  }
}
