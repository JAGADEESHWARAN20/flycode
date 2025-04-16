import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client

interface UserProfileData {
     user_id: string;
     username: string;
     bio?: string;
     avatar_url?: string;
     location?: string;
     website?: string;
}

/**
 * API route handler to update or insert user profile data into the user_profiles table.
 * This route performs an "upsert" operation and restricts access to authenticated users.
 */
export async function POST(request: NextRequest) { // Changed type to NextRequest
     try {
          const supabase = await createClient();
          const {
               data: { session },
          } = await supabase.auth.getSession();

          if (!session?.user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse the user profile data from the request body.
          const { user_id, username, bio, avatar_url, location, website }: UserProfileData = await request.json();

          // Validate the user_id against the authenticated user.
          if (user_id !== session.user.id) {
               return NextResponse.json({ error: 'Forbidden: You can only update your own profile.' }, { status: 403 });
          }

          // Validate the essential data: user_id and username are required for upsert.
          if (!user_id || !username) {
               return NextResponse.json({ error: 'user_id and username are required' }, { status: 400 });
          }

          // Perform the upsert operation.
          const { data, error } = await supabase
               .from('user_profiles')
               .upsert(
                    [ // Ensure it's an array for upsert
                         {
                              user_id,
                              username,
                              bio,
                              avatar_url,
                              location,
                              website,
                              // updated_at: new Date().toISOString(), // REMOVE THIS LINE - rely on trigger
                         },
                    ],
                    { onConflict: 'user_id' } // This will now work after adding the constraint
               )
               .select()
               .single(); // If upserting one item, .single() is good

          if (error) {
               console.error('Supabase error upserting user profile:', error);
               return NextResponse.json(
                    { error: 'Failed to update user profile', details: error.message },
                    { status: 500 }
               );
          }

          return NextResponse.json({ message: 'User profile updated/inserted successfully', data }, { status: 200 });
     } catch (error) {
          console.error('Error in /api/update-profile:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}

