// app/api/auth/register/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    // Validate required fields
    const { email, password, name, username, bio, location, website } = body;
    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Create user in auth system and get user ID
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const userId = authData.user?.id;

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        created_at: new Date().toISOString(),
        is_active: true,
        last_seen: new Date().toISOString(),
      });

    if (userError) throw userError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        username,
        bio: bio || '',
        location: location || '',
        website: website || '',
        joined_date: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    return NextResponse.json({
      message: 'User registered successfully',
      userId
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}