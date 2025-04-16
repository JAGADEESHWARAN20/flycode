import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Corrected type definition for the route parameters
interface Params {
  user_id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
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
      console.error('Error fetching username:', error);
      return NextResponse.json({ error: 'Failed to fetch username', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ username: data.username }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/get-username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
