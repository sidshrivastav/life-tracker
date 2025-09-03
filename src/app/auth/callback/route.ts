import { createClient } from '../../../../utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'
    const state = requestUrl.searchParams.get('state')
    const error_param = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    console.log('🔍 Auth callback received:', { 
      code: !!code, 
      redirectTo,
      state: !!state,
      hasError: !!error_param,
      errorDescription: error_description,
      fullUrl: request.url
    })

    // Check if there's an error parameter in the URL
    if (error_param) {
      console.error('❌ OAuth error in callback URL:', { error_param, error_description })
      return NextResponse.redirect(new URL(`/error?error=${encodeURIComponent(error_param)}&error_description=${encodeURIComponent(error_description || '')}`, request.url))
    }

    if (code) {
      console.log('🔍 Environment check:', {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL
      })
      
      console.log('🔍 Creating Supabase client...')
      const supabase = await createClient()
      console.log('🔍 Client created successfully')
      
      // Add a small delay to see if timing is an issue
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('🔍 Exchanging code for session...')
      const exchangeResult = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('🔍 Exchange code result:', { 
        success: !!exchangeResult.data?.user, 
        error: exchangeResult.error?.message,
        userEmail: exchangeResult.data?.user?.email,
        hasSession: !!exchangeResult.data?.session,
        errorDetails: exchangeResult.error
      })
      
      if (exchangeResult.error) {
        console.error('❌ Auth exchange error details:', {
          message: exchangeResult.error.message,
          status: exchangeResult.error.status,
          name: exchangeResult.error.name,
          cause: exchangeResult.error.cause
        })
        return NextResponse.redirect(new URL(`/error?error=${encodeURIComponent(exchangeResult.error.message)}`, request.url))
      }

      if (exchangeResult.data?.user) {
        console.log('✅ User authenticated successfully, proceeding to dashboard')
      } else {
        console.error('❌ No user data received after successful exchange')
        return NextResponse.redirect(new URL('/error?error=no_user_data', request.url))
      }
    }

    // URL to redirect to after sign up process completes
    const finalRedirectUrl = new URL(redirectTo, request.url)
    console.log('🔍 Final redirect:', {
      redirectTo,
      requestUrl: request.url,
      finalUrl: finalRedirectUrl.toString()
    })
    
    return NextResponse.redirect(finalRedirectUrl)
  } catch (catchError) {
    console.error('❌ Auth callback crashed:', catchError)
    return NextResponse.redirect(new URL(`/error?error=${encodeURIComponent('Authentication failed')}`, request.url))
  }
}