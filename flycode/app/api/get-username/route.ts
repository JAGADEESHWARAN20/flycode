// File: app/api/get-username/route.ts (or the correct path)
import { NextResponse } from 'next/server'; // Removed 'NextRequest' from import
import { createClient } from '@/utils/supabase/server';

/**
 * API route handler to get user profile data from the user_profiles table
 * for the currently authenticated user.
 */
// Removed unused 'request' parameter previously
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
    // Ensure the 'username' field exists before returning
    if (data && typeof data.username !== 'undefined') {
      return NextResponse.json(data, { status: 200 });
    } else {
      // Handle case where profile exists but has no username yet (if possible based on schema)
      // Or if data structure is unexpected
      console.warn('User profile data fetched but missing username:', data);
      // You might return the partial data or a specific message/status
      return NextResponse.json({ message: 'Username not set in profile' }, { status: 404 }); // Or return partial data with 200
    }


  } catch (error) {
    console.error('Error in /api/get-username:', error); // Adjusted path in log
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}