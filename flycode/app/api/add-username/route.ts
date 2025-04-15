// app/api/add-username/route.ts (TypeScript example)
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { username } = await request.json();
    console.log('Received username:', username);
    // Your database update logic here (as discussed in previous responses)
    return NextResponse.json({ message: 'Username updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}
