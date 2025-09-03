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
    // If NEXT_PUBLIC_SITE_URL is set, use it
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // For Vercel deployments
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    // For other production environments, try to detect from headers
    // This is a fallback - you should set NEXT_PUBLIC_SITE_URL in production
    if (process.env.NODE_ENV === 'production') {
      // You should replace this with your actual production domain
      console.warn('NEXT_PUBLIC_SITE_URL not set in production. Please set this environment variable.')
      return 'https://your-production-domain.com'
    }
    
    // Development fallback
    return 'http://localhost:3000'
  }

  const baseUrl = getBaseUrl()

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
