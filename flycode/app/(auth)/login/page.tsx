// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Remove this line if not used
import { supabase } from '@/utils/supabaseClient';


export default function LoginPage() {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const router = useRouter(); // Keep this if you are using it for redirection

     const handleSignInWithGoogle = async () => {
          try {
               setLoading(true);
               const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                         redirectTo: `${window.location.origin}/dashboard`,
                    },
               });

               if (error) {
                    setError(error.message);
               } else {
                    router.push('/dashboard'); // Example: Redirect to dashboard on success
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