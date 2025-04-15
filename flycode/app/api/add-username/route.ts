import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  console.log('API Route Cookies:', Object.fromEntries(cookieStore.entries())); // Log all cookies

  const supabase: SupabaseClient = createRouteHandlerClient({ cookies });

  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ error: 'Username cannot be empty.' }, { status: 400 });
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('Error getting user:', getUserError);
      return NextResponse.json({ error: 'Could not retrieve user information.' }, { status: 401 });
    }

    const userId = user.id;

    // Insert a new username if one doesn't already exist
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({ user_id: userId, username });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Check if the error is due to a unique constraint violation (username already exists)
      if (profileError.code === '23505' && profileError.details?.includes('username')) {
        return NextResponse.json({ error: 'Username already exists.' }, { status: 409 }); // Conflict
      }
      return NextResponse.json({ error: 'Failed to create user profile.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Username added successfully.' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  console.log('PATCH Route Cookies:', Object.fromEntries(cookieStore.entries())); // Use cookieStore

  const supabase: SupabaseClient = createRouteHandlerClient({ cookies });

  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ error: 'Username cannot be empty.' }, { status: 400 });
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('Error getting user:', getUserError);
      return NextResponse.json({ error: 'Could not retrieve user information.' }, { status: 401 });
    }

    const userId = user.id;

    // Update the existing username
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ username })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Username updated successfully.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  console.log('GET Route Cookies:', Object.fromEntries(cookieStore.entries())); // Use cookieStore

  const supabase: SupabaseClient = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      console.error('Error getting user:', getUserError);
      return NextResponse.json({ error: 'Could not retrieve user information.' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile.' }, { status: 500 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
