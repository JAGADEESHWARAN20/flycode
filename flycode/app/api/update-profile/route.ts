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

          // **Attempt to find the user in the 'users' table**
          const { data: existingUser, error: userError } = await supabase
               .from('users')
               .select('id')
               .eq('id', user_id)
               .single();

          if (userError) {
               console.error('Error checking for existing user:', userError);
               return NextResponse.json({ error: 'Error checking user existence', details: userError.message }, { status: 500 });
          }

          // **If the user doesn't exist, attempt to create a minimal record using user_metadata**
          if (!existingUser) {
               const { user } = session;
               const initialName = user?.user_metadata?.name || 'New User'; // Fallback name
               const initialEmail = user?.email;

               if (initialEmail) {
                    const { error: createUserError } = await supabase
                         .from('users')
                         .insert([{ id: user_id, email: initialEmail, name: initialName }]); // You still lack password_hash

                    if (createUserError) {
                         console.error('Error creating user:', createUserError);
                         return NextResponse.json({ error: 'Error creating user record', details: createUserError.message }, { status: 500 });
                    }
                    console.log('Created a new user record:', user_id);
               } else {
                    return NextResponse.json({ error: 'Could not create user, email not available' }, { status: 400 });
               }
          }

          // **Now upsert the user profile**
          const { data: profileData, error: profileError } = await supabase
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

          if (profileError) {
               console.error('Supabase error upserting user profile:', profileError);
               return NextResponse.json(
                    { error: 'Failed to update user profile', details: profileError.message },
                    { status: 500 }
               );
          }

          return NextResponse.json({ message: 'User profile updated successfully', data: profileData }, { status: 200 });
     } catch (error) {
          console.error('Error in /api/update-profile:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}