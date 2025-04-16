import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface UserData {
     email: string;
     name: string;
}

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();
          const { email, name }: UserData = await request.json();

          if (!email || !name) {
               return NextResponse.json({ error: 'Missing required fields (email, name)' }, { status: 400 });
          }

          // Check if a user with this email already exists
          const { data: existingUser, error: selectError } = await supabase
               .from('users')
               .select('id')
               .eq('email', email)
               .single();

          if (selectError) {
               console.error('Error checking for existing user:', selectError);
               return NextResponse.json({ error: 'Error checking user existence', details: selectError.message }, { status: 500 });
          }

          if (!existingUser) {
               const { error: insertError } = await supabase
                    .from('users')
                    .insert([{ email, name, is_active: true }]);

               if (insertError) {
                    console.error('Supabase error inserting user data:', insertError);
                    return NextResponse.json({ error: 'Failed to insert user data', details: insertError.message }, { status: 500 });
               }
               return NextResponse.json({ message: 'User data inserted successfully' }, { status: 201 });
          } else {
               return NextResponse.json({ message: 'User with this email already exists' }, { status: 200 });
          }
     } catch (error) {
          console.error('Error in /api/add-user-data:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}
