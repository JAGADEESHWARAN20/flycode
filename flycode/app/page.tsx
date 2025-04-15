'use client'

import { createClient } from '@/utils/supabase/server'
import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/utils/actions'
import Image from 'next/image'

export default async function Home() {
  const supabase = await createClient()

  const session = await supabase.auth.getUser()

  if (!session.data.user)
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-4xl font-bold'>Not Authenticated</h1>
        <Link className='btn' href='/auth'>
          Sign in
        </Link>
      </div>
    )

  const {
    data: {
      user: { user_metadata, app_metadata },
    },
  } = session

  const { name, email, user_name, avatar_url } = user_metadata

  const userName = user_name ? `@${user_name}` : 'User Name Not Set'

  console.log(session)

  return (
    <div className=''>
      {/* Container at the center of the page */}
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        {avatar_url && (
          <Image
            src={avatar_url}
            alt={name}
            width={200}
            height={200}
            className='rounded-full'
            quality={100}
          />
        )}
        <h1 className='text-4xl font-bold'>{name}</h1>
        <p className='text-xl'>User Name: {userName}</p>
        <p className='text-xl'>Email: {email}</p>
        <p className='text-xl'>Created with: {app_metadata.provider}</p>

        {!user_name && (
          <div className='fixed bottom-8 right-8'>
            <AddUsernameDialog />
          </div>
        )}

        <form action={signOut}>
          <button className='btn' type='submit'>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}

function AddUsernameDialog() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const res = await fetch('/api/add-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    })

    if (res.ok) {
      window.location.reload()
    } else {
      alert('Failed to update username')
    }

    setLoading(false)
  }

  return (
    <div className='p-4 bg-white shadow-md rounded-lg'>
      <h2 className='text-xl font-bold mb-2'>Set Your Username</h2>
      <input
        type='text'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className='border p-2 w-full rounded mb-2'
        placeholder='Enter your username'
      />
      <button
        className='btn w-full'
        onClick={handleSubmit}
        disabled={loading || !username.trim()}
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}