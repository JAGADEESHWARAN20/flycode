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
 * API route handler to get user profile data from the user_profiles table
 * for the currently authenticated user.
 */
export async function GET(request: NextRequest) { // Changed to NextRequest
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*') // Select all columns
      .eq('user_id', userId)
      .single(); // Expect only one profile per user

    if (error) {
      console.error('Supabase error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in /api/get-user-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
