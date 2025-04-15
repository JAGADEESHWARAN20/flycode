// app/api/add-username/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define TypeScript interfaces for better type safety
interface RegistrationRequest {
  email: string;
  password: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
}

interface RegistrationError extends Error {
  code?: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json() as RegistrationRequest;

    // Validate required fields with type checking
    const { email, password, name, username, bio, location, website } = body;

    // Enhanced validation
    if (!email?.trim() || !password?.trim() || !name?.trim() || !username?.trim()) {
      return NextResponse.json(
        { 
          error: 'Required fields are missing',
          details: {
            email: !email?.trim() ? 'Email is required' : null,
            password: !password?.trim() ? 'Password is required' : null,
            name: !name?.trim() ? 'Name is required' : null,
            username: !username?.trim() ? 'Username is required' : null
          }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw checkError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Create user in auth system
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username
        }
      }
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('User ID not generated');
    }

    // Create user record with transaction
    const { error: transactionError } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_email: email,
      p_name: name,
      p_username: username,
      p_bio: bio || '',
      p_location: location || '',
      p_website: website || '',
      p_joined_date: new Date().toISOString()
    });

    if (transactionError) {
      // If transaction fails, attempt to delete the auth user
      await supabase.auth.admin.deleteUser(userId);
      throw transactionError;
    }

    // Return success response
    return NextResponse.json({
      message: 'User registered successfully',
      userId,
      username
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Type guard for error handling
    const registrationError = error as RegistrationError;
    
    // Handle specific error cases
    if (registrationError.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to register user',
        details: process.env.NODE_ENV === 'development' ? registrationError.message : undefined
      },
      { status: 500 }
    );
  }
}

// Add GET method to check username availability
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      available: !data,
      username
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}