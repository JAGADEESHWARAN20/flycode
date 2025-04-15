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

     useEffect(() => {
          // First check existing session
          supabase.auth.getSession().then(({ data: { session } }) => {
               if (session?.user) {
                    setUser(session.user);
                    setLoading(false);
               } else {
                    router.push('/login');
               }
          });

          // Then subscribe to auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
               async (event, session) => {
                    if (event === 'SIGNED_IN' && session?.user) {
                         setUser(session.user);
                         setLoading(false);
                    } else if (event === 'SIGNED_OUT') {
                         setUser(null);
                         router.push('/login');
                    }
               }
          );

          return () => subscription?.unsubscribe();
     }, [router]);

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
          </div>
     );
}