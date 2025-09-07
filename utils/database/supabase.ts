import { createClient } from '@supabase/supabase-js'

// Helper function to get the correct site URL for production-only setup
function getSiteUrl(): string {
  // Force production-only configuration
  // Use NEXT_PUBLIC_SITE_URL or fallback to Vercel domain
  return process.env.NEXT_PUBLIC_SITE_URL || 
         `https://${process.env.VERCEL_URL}` || 
         'https://life-tracker-delta-khaki.vercel.app' // fallback to your actual domain
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