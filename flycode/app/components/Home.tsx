'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/auth-helpers-nextjs';


export default function Home({ session }: { session: Session | null }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  // --- Fetch User Data ---
  const fetchUserData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-username`); // Get profile
      if (res.ok) {
        const data = await res.json();
        setUserName(data.username);
      } else if (res.status === 404) {
        // User profile doesn't exist,  set username to null
        setUserName(null);
      }
      else {
        console.error('Failed to fetch user data:', await res.text());
        toast.error('Failed to load profile data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error loading profile data.');
    } finally {
      setLoading(false);
    }
  }, []);


  // --- Initial Load and Authentication Check ---
  useEffect(() => {
    if (session?.user) {
      fetchUserData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session, fetchUserData]);

  // --- Handle Username Update (and User Table Update) ---
  const handleUsernameUpdate = async (newUsername: string) => {
    setLoading(true);
    try {
      // Update both user_profiles and users tables
      const profileRes = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session!.user.id,
          username: newUsername,
        }),
      });

      const userRes = await fetch('/api/update-user', { //update user table
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: session!.user.id,
          name: newUsername
        })
      })

      if (profileRes.ok && userRes.ok) {
        toast.success('Profile updated successfully!');
        setUserName(newUsername); // Update the local state

      } else {
        const profileError = profileRes.ok ? "" : await profileRes.text();
        const userError = userRes.ok ? "" : await userRes.text();
        console.error('Failed to update profile:', await profileError);
        console.error('Failed to update user:', await userError);
        toast.error('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

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
  const { name, email, avatar_url } = user_metadata;

  const displayUserName = userName ? `@${userName}` : 'User Name Not Set';

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
      <p className="text-xl">
        User Name: {loading ? 'Loading...' : displayUserName}
      </p>
      <p className="text-xl">Email: {email}</p>
      <p className="text-xl">Created with: {app_metadata.provider}</p>

      {!userName && (
        <div className="fixed bottom-8 right-8">
          <AddUsernameDialog onUsernameUpdate={handleUsernameUpdate} />
        </div>
      )}

      <form action="/auth">
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}

function AddUsernameDialog({ onUsernameUpdate }: { onUsernameUpdate: (username: string) => void }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    if (!username.trim()) {
      toast.error('Username cannot be empty.');
      setLoading(false);
      return;
    }

    onUsernameUpdate(username); // Call the callback
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
