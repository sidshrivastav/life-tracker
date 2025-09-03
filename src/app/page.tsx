import { signInWithGoogle } from './login/actions'

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Life Tracker</h1>
          <p className="text-lg text-gray-600">Track your life, achieve your goals</p>
        </div>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-500">Sign in to get started</p>
          
          <form>
            <button
              formAction={signInWithGoogle}
              className="w-full flex justify-center items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </form>
          
          <div className="text-xs text-gray-400">
            <a 
              href="/login" 
              className="text-indigo-600 hover:text-indigo-500 hover:underline"
            >
              Other sign in options
            </a>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
