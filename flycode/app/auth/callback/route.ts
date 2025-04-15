// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
     const { searchParams, origin } = new URL(request.url);
     const code = searchParams.get('code');
     const next = searchParams.get('next') ?? '/dashboard';

     if (code) {
          const supabase = await createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (!error) {
               const forwardedHost = request.headers.get('x-forwarded-host');
               const isLocalEnv = process.env.NODE_ENV === 'development';

               // Determine the correct redirect URL
               let redirectUrl = `${origin}${next}`;

               if (!isLocalEnv && forwardedHost) {
                    const protocol = request.headers.get('x-forwarded-proto') || 'https';
                    redirectUrl = `${protocol}://${forwardedHost}${next}`;
               }

               return NextResponse.redirect(redirectUrl);
          }
     }

     // Handle error cases
     return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent('Authentication failed')}`
     );
}