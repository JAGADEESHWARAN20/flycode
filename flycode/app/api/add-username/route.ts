// /app/api/add-username/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type

export async function POST(request: Request) {
  const supabase: SupabaseClient = createRouteHandlerClient({ cookies }); // Explicitly type supabase

  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return new NextResponse(JSON.stringify({ error: 'Username cannot be empty.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('Error getting user:', getUserError);
      return new NextResponse(JSON.stringify({ error: 'Could not retrieve user information.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // 1. Update the user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(
        { user_id: userId, username },
        { onConflict: 'user_id' }
      );

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return new NextResponse(JSON.stringify({ error: 'Failed to update user profile.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Update the users table with the username (optional)
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ user_name: username })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating users table:', userUpdateError);
    }

    return new NextResponse(JSON.stringify({ message: 'Username updated successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) { // Use 'unknown' or a more specific type
    console.error('Unexpected error:', error);
    return new NextResponse(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
