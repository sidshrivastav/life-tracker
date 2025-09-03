import { createClient } from '../../../../utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

    console.log('🔍 Auth callback received:', { code: !!code, redirectTo })

    if (code) {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('🔍 Exchange code result:', { 
        success: !!data?.user, 
        error: error?.message,
        userEmail: data?.user?.email 
      })
      
      if (error) {
        console.error('❌ Auth exchange error:', error)
        return NextResponse.redirect(new URL(`/error?error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (data?.user) {
        // Check if the user is authorized
        const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
        const userEmail = data.user.email

        console.log('🔍 Authorization check:', { 
          authorizedEmail, 
          userEmail, 
          matches: userEmail?.toLowerCase() === authorizedEmail?.toLowerCase() 
        })

        if (!authorizedEmail || !userEmail || userEmail.toLowerCase() !== authorizedEmail.toLowerCase()) {
          console.warn('⚠️ Unauthorized user attempt:', userEmail)
          // Sign out the unauthorized user and redirect to error
          try {
            await supabase.auth.signOut()
            console.log('🔍 Successfully signed out unauthorized user')
          } catch (signOutError) {
            console.error('❌ Error signing out unauthorized user:', signOutError)
          }
          return NextResponse.redirect(new URL('/error?message=unauthorized', request.url))
        }

        console.log('✅ User authorized, proceeding to dashboard')
      } else {
        console.error('❌ No user data received after successful exchange')
        return NextResponse.redirect(new URL('/error?error=no_user_data', request.url))
      }
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(new URL(redirectTo, request.url))
  } catch (catchError) {
    console.error('❌ Auth callback crashed:', catchError)
    return NextResponse.redirect(new URL(`/error?error=${encodeURIComponent('Authentication failed')}`, request.url))
  }
}