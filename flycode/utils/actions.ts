'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Define a type for the provider to remove the implicit 'any' issue
type AuthProvider = 'google' | 'github' | 'facebook' | 'twitter' // Add other providers as needed

const signInWith = (provider: AuthProvider) => async () => {
     const supabase = await createClient()

     const auth_callback_url = `${process.env.SITE_URL}/auth/callback`

     const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
               redirectTo: auth_callback_url,
          },
     })

     console.log(data)

     if (error) {
          console.log(error)
     }

     // Ensure `data.url` is not null before passing it to `redirect`
     if (data?.url) {
          redirect(data.url)
     } else {
          console.error('Redirect URL is null')
     }
}

const signinWithGoogle = signInWith('google')

const signOut = async (): Promise<void> => {
     const supabase = await createClient()
     await supabase.auth.signOut()
}

export { signinWithGoogle, signOut }