// File: app/api/get-user-profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Removed unused UserProfileData interface import/definition

/**
 * API route handler to get user profile data from the user_profiles table
 * for the currently authenticated user.
 */
// Removed unused 'request' parameter
export async function GET() {
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
      // Handle specific case where profile doesn't exist yet
      if (error.code === 'PGRST116') { // PostgREST error code for "Not Found" with .single()
        return NextResponse.json({ message: 'User profile not found' }, { status: 404 });
      }
      console.error('Supabase error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: error.message },
        { status: 500 }
      );
    }

    // No need to check !data if error handling for PGRST116 is done
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error in /api/get-user-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}