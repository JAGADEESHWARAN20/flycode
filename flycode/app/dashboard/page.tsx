// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Session } from '@supabase/supabase-js';

type User = Session['user'] | null;

export default function DashboardPage() {
     const [user, setUser] = useState<User>(null);
     const router = useRouter();
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchSession = async () => {
               const { data: { session } } = await supabase.auth.getSession();
               if (session?.user) {
                    setUser(session.user);
                    setLoading(false);
               } else {
                    router.push('/(auth)/login');
               }
          };

          fetchSession();

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
               async (event, session) => {
                    if (session?.user) {
                         setUser(session.user);
                    } else {
                         setUser(null);
                         router.push('/(auth)/login');
                    }
               }
          );

          return () => {
               if (subscription?.unsubscribe) {
                    subscription.unsubscribe();
               }
          };
     }, [router]);

     if (loading) {
          return <div>Loading dashboard...</div>;
     }

     if (!user) {
          return <div>Not authenticated. Redirecting to login...</div>;
     }

     return (
          <div className="p-6">
               <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
               <p>Welcome, {user?.email}!</p>
               {/* You can display more user information here */}
          </div>
     );
}