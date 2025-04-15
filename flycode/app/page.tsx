import { createClient } from '@/utils/supabase/server'
import Home from './components/Home'

export default async function Page() {
  const supabase = await createClient()

  // Fetch the session, which includes access_token, refresh_token, etc.
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error fetching session:', error.message)
  }

  return <Home session={session} />
}