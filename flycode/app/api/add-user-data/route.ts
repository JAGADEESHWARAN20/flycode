// app/api/add-user-data/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface UserData {
     id: string;
     email: string;
     name: string;
}

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();

          const { id, email, name }: UserData = await request.json();

          if (!id || !email || !name) {
               return NextResponse.json({ error: 'Missing required fields (id, email, name)' }, { status: 400 });
          }

          // Check if the user already exists
          const { data: existingUser, error: selectError } = await supabase
               .from('users')
               .select('id')
               .eq('id', id)
               .single();

          if (selectError) {
               console.error('Error checking for existing user:', selectError);
               return NextResponse.json({ error: 'Error checking user existence', details: selectError.message }, { status: 500 });
          }

          if (!existingUser) {
               const { error: insertError } = await supabase
                    .from('users')
                    .insert([{ id, email, name, is_active: true }]); // Initial is_active

               if (insertError) {
                    console.error('Supabase error inserting user data:', insertError);
                    return NextResponse.json({ error: 'Failed to insert user data', details: insertError.message }, { status: 500 });
               }
               return NextResponse.json({ message: 'User data inserted successfully' }, { status: 201 });
          } else {
               return NextResponse.json({ message: 'User already exists' }, { status: 200 });
          }
     } catch (error) {
          console.error('Error in /api/add-user-data:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
}