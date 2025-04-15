// app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
     const requestUrl = new URL(request.url);
     const code = requestUrl.searchParams.get('code');
     const next = requestUrl.searchParams.get('next') || '/dashboard';

     if (code) {
          const supabase = await createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error) {
               // Important: Wait a moment to ensure session is fully propagated
               await new Promise(resolve => setTimeout(resolve, 500));
               return NextResponse.redirect(requestUrl.origin + next);
          }
     }

     return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed')}`
     );
}