import { createClient } from '../../../../utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL(`/error?error=${encodeURIComponent(error.message)}`, request.url))
    }

    // Check if the user is authorized
    const authorizedEmail = process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
    const userEmail = data?.user?.email

    if (!authorizedEmail || !userEmail || userEmail.toLowerCase() !== authorizedEmail.toLowerCase()) {
      // Sign out the unauthorized user and redirect to error
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/error?message=unauthorized', request.url))
    }
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(new URL(redirectTo, request.url))
}