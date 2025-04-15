// app/auth/auth-code-error/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally, you can log something or perform other actions here
    console.error("Authentication code exchange failed.");
  }, []);

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>There was an error during the sign-in process.</p>
      <p>Please try again or contact support if the issue persists.</p>
      <button onClick={() => router.push('/')}>Go back to homepage</button>
    </div>
  );
}