// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient'; // Adjust import path as needed

export default function LoginPage() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const router = useRouter();

     const handleSignInWithGoogle = async () => {
          try {
               setLoading(true);
               const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                         redirectTo: `${window.location.origin}/dashboard`, // Redirect after successful login
                    },
               });

               if (error) {
                    setError(error.message);
               }
          } catch (err: any) {
               setError(err.message);
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