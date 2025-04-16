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

    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('user_id', session.user.id)
      .single();

    if (selectError) {
      console.error('Supabase error fetching username:', selectError);
      return NextResponse.json({ error: 'Failed to fetch username', details: selectError.message }, { status: 500 });
    }

    if (existingProfile) {
      return NextResponse.json({ username: existingProfile.username }, { status: 200 });
    }

    // If no profile exists, create a new one
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([{ user_id: session.user.id, username: 'New User' }]);

    if (insertError) {
      console.error('Supabase error inserting user profile:', insertError);
      return NextResponse.json({ error: 'Failed to create user profile', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ username: 'New User' }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/get-username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
