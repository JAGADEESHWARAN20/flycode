// app/page.tsx

import { createClient } from '@/utils/supabase/server'
import Home from '@/app/components/Home'

export default async function Page() {
  const supabase = await createClient()
  // Fetch the user session on the server
  const { data: session } = await supabase.auth.getUser()

  return (
    <Home session={session} />
  )
}