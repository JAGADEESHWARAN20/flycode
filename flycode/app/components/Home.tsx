'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/auth-helpers-nextjs';

export default function Home({ session }: { session: Session | null }) {
  // Log the session object to verify the required parameters
  useEffect(() => {
    console.log('Session Object:', session); // Console log the session object
  }, [session]);

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-4xl font-bold">Not Authenticated</h1>
        <Link href="/auth">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  const { user_metadata, app_metadata } = session.user;
  const { name, email, user_name, avatar_url } = user_metadata;

  const userName = user_name ? `@${user_name}` : 'User Name Not Set';

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      {avatar_url && (
        <Image
          src={avatar_url}
          alt={name}
          width={200}
          height={200}
          className="rounded-full"
          quality={100}
        />
      )}
      <h1 className="text-4xl font-bold">{name}</h1>
      <p className="text-xl">User Name: {userName}</p>
      <p className="text-xl">Email: {email}</p>
      <p className="text-xl">Created with: {app_metadata.provider}</p>

      {!user_name && (
        <div className="fixed bottom-8 right-8">
          <AddUsernameDialog />
        </div>
      )}

      <form action="/auth">
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}

function AddUsernameDialog() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/add-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      toast.success('Username updated successfully!'); // Success toast
      window.location.reload();
    } else {
      toast.error('Failed to update username'); // Error toast
    }

    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Set Your Username</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <Button onClick={handleSubmit} disabled={loading || !username.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
