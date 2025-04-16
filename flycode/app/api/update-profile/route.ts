// app/api/update-profile/route.ts (or pages/api/update-profile.ts)
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface UserProfileData {
     user_id: string;
     username: string;
     bio?: string;
     avatar_url?: string;
     location?: string;
     website?: string;
}

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();
          const {
               data: { session },
          } = await supabase.auth.getSession();

          if (!session?.user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { user_id, username, bio, avatar_url, location, website }: UserProfileData = await request.json();

          if (user_id !== session.user.id) {
               return NextResponse.json({ error: 'Forbidden: You can only update your own profile.' }, { status: 403 });
          }

          if (!user_id || !username) {
               return NextResponse.json({ error: 'user_id and username are required' }, { status: 400 });
          }

          const { data, error } = await supabase
               .from('user_profiles')
               .upsert(
                    [
                         {
                              user_id,
                              username,
                              bio,
                              avatar_url,
                              location,
                              website,
                         },
                    ],
                    { onConflict: 'user_id' }
               )
               .select()
               .single();

          if (error) {
               console.error('Supabase error upserting user profile:', error);
               return NextResponse.json(
                    { error: 'Failed to update user profile', details: error.message },
                    { status: 500 }
               );
          }

          return NextResponse.json({ message: 'User profile updated successfully', data }, { status: 200 });
     } catch (error) {
          console.error('Error in /api/update-profile:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}