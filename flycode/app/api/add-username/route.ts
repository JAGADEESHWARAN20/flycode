// app/api/add-username/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
     const supabase = await createClient();
     const { username } = await req.json();

     // Get the current user's session
     const { data: { session } } = await supabase.auth.getSession();

     if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const userId = session.user.id;

     // Check if the username is already taken
     const { data: existingUser, error: usernameCheckError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', username)
          .single();

     if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
          // An error occurred during the check
          console.error("Error checking username:", usernameCheckError);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }

     if (existingUser) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
     }

     // Update the username in the user_profiles table
     const { data, error: updateError } = await supabase
          .from('user_profiles')
          .update({ username: username })
          .eq('user_id', userId) // Use user_id to update
          .select();

     if (updateError) {
          console.error("Error updating username:", updateError);
          return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
     }

     return NextResponse.json({ message: 'Username updated successfully', data }, { status: 200 });
}
