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

  // Production-only URL configuration
  const getBaseUrl = () => {
    // Always use production URLs - no localhost support
    let baseUrl = ''
    
    // Check for Vercel-specific environment variables first
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL.trim().replace(/\s+/g, '')}`
    } else if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\s+/g, '')}`
    } else if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    } else {
      // Fallback to your actual Vercel domain
      baseUrl = 'https://life-tracker-delta-khaki.vercel.app'
    }
    
    // Comprehensive URL cleaning and validation
    const cleanedUrl = baseUrl.trim().replace(/\s+/g, '')
    
    // Ensure the URL starts with https:// (production only)
    if (!cleanedUrl.startsWith('https://')) {
      console.warn('⚠️ Invalid production URL format detected:', cleanedUrl)
      return 'https://life-tracker-delta-khaki.vercel.app'
    }
    
    return cleanedUrl
  }

  const baseUrl = getBaseUrl()
  
  // Production debug logging
  console.log('Production OAuth Redirect Debug:', {
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
  } catch (catchError: unknown) {
    // Don't treat Next.js redirect errors as actual errors
    if (typeof catchError === 'object' && catchError !== null && 'digest' in catchError && 
        typeof (catchError as { digest?: string }).digest === 'string' && 
        (catchError as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw catchError // Re-throw redirect errors to let Next.js handle them
    }
    console.error('❌ signInWithGoogle crashed:', catchError)
    redirect(`/error?error=${encodeURIComponent('OAuth initialization failed')}`)
  }
}
