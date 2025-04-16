import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Define an interface for the route parameters
interface Params {
  user_id: string;
}

// Define the type for the second argument of the GET function
type RouteParams = {
  params: Params;
};

/**
 * API route handler to retrieve a username from the user_profiles table in Supabase.
 */
export async function GET(
  request: Request,
  context: RouteParams // Use the RouteParams type here
) {
  const { params } = context;
  const { user_id } = params;

  if (!user_id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('id', user_id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve username', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ username: data.username }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/get-username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
