import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client

interface UserData {
     id: string;
     email: string;
     name: string;
}

/**
 * API route handler to insert user data into the users table upon successful authentication.
 *
 * @param request The incoming HTTP request.
 * @returns A NextResponse object indicating the success or failure of the operation.
 */
export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();

          // Parse the user data from the request body.
          const { id, email, name }: UserData = await request.json();

          // Validate the user data.  Id, email, and name are required by your schema.
          if (!id || !email || !name) {
               return NextResponse.json({ error: 'Missing required fields (id, email, name)' }, { status: 400 });
          }

          // Insert the user data into the users table.
          const { error } = await supabase
               .from('users') // Ensure this is your table name
               .insert([
                    {
                         id,
                         email,
                         name,
                         // password_hash should NOT be set here.  Supabase auth handles that.
                         // created_at is handled by the database default.
                         is_active: true, // You might want to set this initially.
                         // last_seen: You'd typically update this on subsequent logins.
                    },
               ]);

          if (error) {
               // Check for a specific error: duplicate email.
               if (error.code === '23505' && error.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
                    return NextResponse.json({ error: 'Email already exists' }, { status: 409 }); // Conflict
               }

               console.error('Supabase error inserting user data:', error);
               return NextResponse.json(
                    { error: 'Failed to insert user data', details: error.message },
                    { status: 500 }
               );
          }

          return NextResponse.json({ message: 'User data inserted successfully' }, { status: 201 });
     } catch (error) {
          console.error('Error in /api/add-user-on-auth:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
