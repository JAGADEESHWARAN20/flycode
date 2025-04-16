'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/auth-helpers-nextjs';

interface ProfileFormData {
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  // Add other profile fields as needed
}

export default function Home({ session }: { session: Session | null }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInitialized, setUserInitialized] = useState(false); // Track if user data initialization is complete

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-username`);
      if (res.ok) {
        const data = await res.json();
        setUserName(data.username);
      } else if (res.status === 404) {
        setUserName(null);
      } else {
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

  useEffect(() => {
    const initializeUser = async () => {
      if (session?.user && !userInitialized) {
        try {
          const addUserRes = await fetch('/api/add-user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.user_metadata?.name || 'New User',
            }),
          });

          if (!addUserRes.ok) {
            console.error('Failed to add user data:', await addUserRes.text());
            toast.error('Failed to initialize user data.');
          }
          setUserInitialized(true); // Mark initialization as complete
          await fetchUserData(); // Fetch profile data after potentially adding user
        } catch (error) {
          console.error('Error during user initialization:', error);
          toast.error('Error initializing user.');
        }
      } else if (!session?.user) {
        setLoading(false);
        setUserInitialized(true); // No user, so initialization is considered done
      }
    };

    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, fetchUserData, userInitialized]);

  const handleUsernameUpdate = async (profileData: ProfileFormData) => {
    if (!session) {
      toast.error('You must be logged in to update your profile.');
      return;
    }
    setLoading(true);
    try {
      const profileRes = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          username: profileData.username,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          // Add other profile fields here
        }),
      });

      if (profileRes.ok) {
        toast.success('Profile updated successfully!');
        setUserName(profileData.username);
      } else {
        const profileErrorText = profileRes.ok ? "" : await profileRes.text();
        console.error('Failed to update profile:', `Profile API Error (${profileRes.status}): ${profileErrorText}`);
        toast.error(`Failed to update profile. Profile API Error (${profileRes.status}): ${profileErrorText}`);
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

  const user_metadata = session.user.user_metadata || {};
  const app_metadata = session.user.app_metadata || {};

  const name = user_metadata.name || 'Name Not Set';
  const email = session.user.email || 'Email Not Available';
  const avatar_url = user_metadata.avatar_url;
  const provider = app_metadata.provider || 'Unknown';

  const displayUserName = loading ? 'Loading username...' : userName ? `@${userName}` : 'User Name Not Set';

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
      {avatar_url && (
        <Image
          src={avatar_url}
          alt={name || 'User Avatar'}
          width={200}
          height={200}
          className="rounded-full border-4 border-gray-200"
          quality={100}
          priority
        />
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-center">{name}</h1>
      <div className="text-center space-y-1">
        <p className="text-lg md:text-xl">
          {displayUserName}
        </p>
        <p className="text-lg md:text-xl text-gray-600">Email: {email}</p>
        <p className="text-lg md:text-xl text-gray-600">Provider: {provider}</p>
      </div>

      {!loading && !userName && userInitialized && (
        <div className="fixed bottom-8 right-8 z-10">
          <AddUsernameDialog onProfileUpdate={handleUsernameUpdate} initialAvatarUrl={avatar_url} />
        </div>
      )}

      <form action="/auth" method="post">
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}

interface AddUsernameDialogProps {
  onProfileUpdate: (data: ProfileFormData) => void;
  initialAvatarUrl?: string | null;
}

function AddUsernameDialog({ onProfileUpdate, initialAvatarUrl }: AddUsernameDialogProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
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
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores.');
      setLoading(false);
      return;
    }

    try {
      await onProfileUpdate({ username, bio, location, website });
      // Optionally close the dialog here if you manage its open state
    } finally {
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username (no spaces)"
            aria-label="Username Input"
            required
            pattern="^[a-zA-Z0-9_]+$"
            title="Username can only contain letters, numbers, and underscores."
          />
          <Input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio (optional)"
            aria-label="Bio Input"
          />
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            aria-label="Location Input"
          />
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website (optional)"
            aria-label="Website Input"
          />
          {/* You might want a more sophisticated way to handle avatar URL */}
          <Input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Avatar URL (optional)"
            aria-label="Avatar URL Input"
          />
          <Button type="submit" disabled={loading || !username.trim()}>
            {loading ? 'Saving...' : 'Save Username'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}