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

  // Production-only URL configuration - ALWAYS use production domain
  const getBaseUrl = () => {
    // Force production domain to avoid preview URL mismatches
    const productionUrl = 'https://life-tracker-delta-khaki.vercel.app'
    
    // Only use NEXT_PUBLIC_SITE_URL if it matches production domain
    if (process.env.NEXT_PUBLIC_SITE_URL && 
        process.env.NEXT_PUBLIC_SITE_URL === productionUrl) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // Always fallback to production domain to prevent preview URL issues
    return productionUrl
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
