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
  // Removed unused userId parameter from the function definition
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure you are calling the correct endpoint.
      // If the file is `get-username/route.ts`, use `/api/get-username`
      // If the file is `get-user-profile/route.ts`, use `/api/get-user-profile`
      const res = await fetch(`/api/get-username`); // Make sure this matches the API file path

      if (res.ok) {
        const data = await res.json();
        setUserName(data.username); // Assumes the API returns an object with a `username` key
      } else if (res.status === 404) {
        // User profile or username doesn't exist
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
  }, []); // Dependency array remains empty


  // --- Initial Load and Authentication Check ---
  useEffect(() => {
    if (session?.user) {
      // Removed the argument when calling fetchUserData
      fetchUserData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); // Dependency on fetchUserData removed as it's stable due to useCallback([])

  // --- Handle Username Update (and User Table Update) ---
  // Inside Home.tsx component

  const handleUsernameUpdate = async (newUsername: string) => {
    if (!session) {
      toast.error('You must be logged in to update your profile.');
      return;
    }
    setLoading(true);
    try {
      // Update profile username
      const profileRes = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          username: newUsername,
        }),
      });

      // Update the 'name' in the 'users' table
      // *** CHANGE THE ENDPOINT HERE ***
      const userRes = await fetch('/api/update-user', { // Use the update endpoint
        method: 'POST', // Or PUT/PATCH if your update-user API uses that
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id, // ID of the user to update
          name: newUsername     // The new name value
          // Only send fields required by /api/update-user for an update
        })
      });

      if (profileRes.ok && userRes.ok) {
        toast.success('Profile updated successfully!');
        setUserName(newUsername);
      } else {
        // Improved error reporting
        const profileErrorText = profileRes.ok ? "" : await profileRes.text();
        const userErrorText = userRes.ok ? "" : await userRes.text();
        const profileError = profileRes.ok ? "" : `Profile API Error (${profileRes.status}): ${profileErrorText}`;
        const userError = userRes.ok ? "" : `User API Error (${userRes.status}): ${userErrorText}`;

        console.error('Failed to update profile:', profileError || 'Success');
        console.error('Failed to update user:', userError || 'Success');
        toast.error(`Failed to update profile. ${profileError} ${userError}`);
      }
    } catch (error) {
      console.error('Error during update process:', error);
      toast.error('An unexpected error occurred during the update.');
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

  // Ensure user_metadata and app_metadata exist before destructuring
  const user_metadata = session.user.user_metadata || {};
  const app_metadata = session.user.app_metadata || {};

  // Provide default values if properties might be missing
  const name = user_metadata.name || 'Name Not Set';
  const email = session.user.email || 'Email Not Available'; // Email is usually top-level
  const avatar_url = user_metadata.avatar_url; // Can be null/undefined
  const provider = app_metadata.provider || 'Unknown';

  const displayUserName = userName ? `@${userName}` : 'User Name Not Set';

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      {avatar_url && (
        <Image
          src={avatar_url}
          alt={name || 'User Avatar'} // Provide default alt text
          width={200}
          height={200}
          className="rounded-full border-4 border-gray-200" // Added some styling
          quality={100}
          priority // Consider adding priority if it's LCP
        />
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-center">{name}</h1>
      <div className="text-center space-y-1"> {/* Grouped related text */}
        <p className="text-lg md:text-xl">
          {loading ? 'Loading username...' : displayUserName}
        </p>
        <p className="text-lg md:text-xl text-gray-600">Email: {email}</p>
        <p className="text-lg md:text-xl text-gray-600">Provider: {provider}</p>
      </div>


      {/* Conditionally render Dialog only when username is not set and not loading */}
      {!loading && !userName && (
        <div className="fixed bottom-8 right-8 z-10">
          <AddUsernameDialog onUsernameUpdate={handleUsernameUpdate} />
        </div>
      )}

      {/* Sign out form - ensure action points to your signout logic */}
      <form action="/auth/signout" method="post"> {/* Usually POST for signout */}
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}

function AddUsernameDialog({ onUsernameUpdate }: { onUsernameUpdate: (username: string) => void }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state for the dialog action

  const handleSubmit = async (event: React.FormEvent) => { // Added event type
    event.preventDefault(); // Prevent default form submission if wrapped in form
    setLoading(true); // Use local loading state
    if (!username.trim()) {
      toast.error('Username cannot be empty.');
      setLoading(false);
      return;
    }
    if (username.includes(' ')) {
      toast.error('Username cannot contain spaces.');
      setLoading(false);
      return;
    }
    // Basic validation example (you might add more)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores.');
      setLoading(false);
      return;
    }


    try {
      // Call the callback passed from the parent
      await onUsernameUpdate(username);
      // Optionally close the dialog here if you manage its open state
    } finally {
      // Ensure loading state is reset even if parent function throws error
      setLoading(false);
    }
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
        {/* Use a form for better accessibility and handling */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username (no spaces)"
            aria-label="Username Input" // Accessibility
            required // HTML5 validation
            pattern="^[a-zA-Z0-9_]+$" // HTML5 pattern validation
            title="Username can only contain letters, numbers, and underscores."
          />
          <Button type="submit" disabled={loading || !username.trim()}>
            {loading ? 'Saving...' : 'Save Username'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}