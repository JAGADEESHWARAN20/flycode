// app/api/get-username/route.ts (or pages/api/get-username.ts)
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Supabase error fetching username:', error);
      return NextResponse.json({ error: 'Failed to fetch username', details: error.message }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ username: data.username }, { status: 200 });
    }

    return NextResponse.json({ username: null }, { status: 200 }); // Or 404 if you strictly require a username
  } catch (error) {
    console.error('Error in /api/get-username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}