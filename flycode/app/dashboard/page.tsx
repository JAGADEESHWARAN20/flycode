// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Session } from '@supabase/supabase-js';

export default function DashboardPage() {
     const [user, setUser] = useState<Session['user'] | null>(null);
     const router = useRouter();
     const [loading, setLoading] = useState(true);
     const [initialCheckComplete, setInitialCheckComplete] = useState(false);

     useEffect(() => {
          // First check existing session
          const checkSession = async () => {
               const { data: { session }, error } = await supabase.auth.getSession();

               if (error) {
                    console.error('Session error:', error);
                    router.push('/login');
                    return;
               }

               if (session?.user) {
                    setUser(session.user);
               } else {
                    router.push('/login');
               }
               setInitialCheckComplete(true);
               setLoading(false);
          };

          checkSession();

          // Then subscribe to auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
               async (event, session) => {
                    if (event === 'INITIAL_SESSION' && initialCheckComplete) {
                         return; // Skip initial session event after we've already checked
                    }

                    if (session?.user) {
                         setUser(session.user);
                         setLoading(false);
                    } else {
                         setUser(null);
                         router.push('/login');
                    }
               }
          );

          return () => subscription?.unsubscribe();
     }, [router, initialCheckComplete]);

     if (loading) {
          return <div>Loading dashboard...</div>;
     }

     if (!user) {
          return null; // Let the useEffect handle redirection
     }

     return (
          <div className="p-6">
               <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
               <p>Welcome, {user.email}!</p>
               <button
                    onClick={async () => {
                         await supabase.auth.signOut();
                         router.push('/login');
                    }}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
               >
                    Sign Out
               </button>
          </div>
     );
}