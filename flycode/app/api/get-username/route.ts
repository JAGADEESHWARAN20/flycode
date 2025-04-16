import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client

/**
 * API route handler to retrieve all usernames from the user_profiles table.
 *
 * @returns A NextResponse object containing an array of usernames or an error.
 */
export async function GET() {
  try {
    const supabase = await createClient(); // Use your server-side Supabase client
    const { data, error } = await supabase
      .from('user_profiles') // Specify the table name
      .select('username');    // Select only the 'username' column

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve usernames', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No usernames found' }, { status: 200 }); // Or 404, depending on your needs
    }

    // If successful, data will be an array of objects, e.g., [{ username: 'user1' }, { username: 'user2' }, ...]
    // We want to return just the array of usernames.
    const usernames = data.map(user => user.username);

    return NextResponse.json({ usernames }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/get-all-usernames:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
