// app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
     const requestUrl = new URL(request.url);
     const code = requestUrl.searchParams.get('code');
     const error = requestUrl.searchParams.get('error');
     const next = requestUrl.searchParams.get('next') || '/dashboard';

     if (error) {
          return NextResponse.redirect(
               `${requestUrl.origin}/login?error=${encodeURIComponent(error)}`
          );
     }

     if (code) {
          const supabase =await createClient();
          const { error: authError } = await supabase.auth.exchangeCodeForSession(code);

          if (authError) {
               console.error('Auth error:', authError);
               return NextResponse.redirect(
                    `${requestUrl.origin}/login?error=${encodeURIComponent(authError.message)}`
               );
          }

          // Successful authentication
          return NextResponse.redirect(`${requestUrl.origin}${next}`);
     }

     // Fallback redirect if no code or error
     return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}