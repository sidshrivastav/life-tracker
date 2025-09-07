import { createClient } from '@supabase/supabase-js'

// Helper function to get the correct site URL for production-only setup
function getSiteUrl(): string {
  // Force production domain to avoid preview URL mismatches
  const productionUrl = 'https://life-tracker-delta-khaki.vercel.app'
  
  // Only use NEXT_PUBLIC_SITE_URL if it matches production domain
  if (process.env.NEXT_PUBLIC_SITE_URL && 
      process.env.NEXT_PUBLIC_SITE_URL === productionUrl) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Always use production domain
  return productionUrl
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true
  }
})

// Helper function to sign in with Google OAuth for production
export const signInWithGoogle = () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?redirect_to=/dashboard`
    }
  })
}

export { getSiteUrl }