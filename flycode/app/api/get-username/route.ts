import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// ----------------------------------------------------------------------
// Error:
// ----------------------------------------------------------------------
// app/api/get-username/route.ts
// Type error: Route "app/api/get-username/route.ts" has an invalid "GET" export:
//    Type "{ params: Params; }" is not a valid type for the function's second argument.
// ----------------------------------------------------------------------
// Explanation:
// ----------------------------------------------------------------------
// Next.js API route handlers require a specific type definition for the route parameters.
// The original code was very close, but Next.js expects the parameters to be structured in a particular way.
// ----------------------------------------------------------------------
// Solution:
// ----------------------------------------------------------------------

// Define an interface for the route parameters
interface Params {
  user_id: string;
}

// Correctly define the GET function with the parameter type
export async function GET(
  request: Request,
  { params }: { params: Params } // Corrected parameter type
) {
  const { user_id } = params;

  if (!user_id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Use your server-side Supabase client
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_profiles') // Ensure this is your actual table name
      .select('username')
      .eq('id', user_id)     // Ensure 'id' matches your user ID column
      .single();             // Expect a single result

    if (error) {
      console.error('Error fetching username:', error);
      return NextResponse.json(
        { error: 'Failed to fetch username', details: error.message },
        { status: 500 }
      );
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

// ----------------------------------------------------------------------
// Key Points:
// ----------------------------------------------------------------------
// 1.  Type Definition: The core issue was the type annotation for the 'params' object.
//     Next.js expects it to be structured as:
//     { params }: { params: YourParamsInterface }
// 2.  Interface: We define the Params interface to clearly specify the expected shape of the route parameters.
// 3.  Supabase Client:  The code uses your '@/utils/supabase/server' to get the Supabase client, which is the correct
//     way to handle Supabase in a Next.js server-side route.
// 4.  Error Handling:  The code includes robust error handling for the Supabase query and other potential issues.
// 5.  Table and Column Names:  Double-check that 'user_profiles' and 'id' match your actual Supabase table and column names.
// ----------------------------------------------------------------------
