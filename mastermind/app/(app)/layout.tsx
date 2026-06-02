export const dynamic = 'force-dynamic'

import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { isAdmin as checkAdmin } from '@/lib/admin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = checkAdmin(user?.email)

  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <Navbar isAdmin={isAdmin} />
    </div>
  )
}
