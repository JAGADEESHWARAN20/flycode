// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function LoginPage() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     // const router = useRouter();

     // const getCallbackUrl = () => {
     //      // Handle both client-side and server-side rendering
     //      if (typeof window !== 'undefined') {
     //           return `${window.location.origin}/auth/callback`;
     //      }
     //      return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
     // };

     const handleSignInWithGoogle = async () => {
          try {
               setLoading(true);
               setError(null);

               const { error: authError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                         redirectTo: 'https://flycode.vercel.app/auth/callback'
                    }
               });

               if (authError) {
                    throw new Error(authError.message);
               }
          } catch (err) {
               setError(err instanceof Error ? err.message : 'An unknown error occurred');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6">
               <h1 className="text-2xl font-bold mb-4">Login</h1>
               <button
                    onClick={handleSignInWithGoogle}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
               >
                    {loading ? 'Signing in with Google...' : 'Sign in with Google'}
               </button>
               {error && <p className="text-red-500 mt-2">Error: {error}</p>}
          </div>
     );
}