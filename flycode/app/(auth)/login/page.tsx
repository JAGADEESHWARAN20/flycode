// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function LoginPage() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const router = useRouter();

     const handleSignInWithGoogle = async () => {
          try {
               setLoading(true);
               const { error: authError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                         redirectTo: `/`,
                    },
               });

               if (authError) {
                    setError(authError.message);
               } else {
                    router.push('/dashboard');
               }
          } catch (err) {
               // Use a more specific error type if possible, otherwise keep it as Error
               setError((err as Error).message);
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
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
               >
                    {loading ? 'Signing in with Google...' : 'Sign in with Google'}
               </button>
               {error && <p className="text-red-500 mt-2">Error: {error}</p>}
          </div>
     );
}
