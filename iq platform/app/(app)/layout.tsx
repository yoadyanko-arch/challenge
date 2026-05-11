import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === process.env.ADMIN_EMAIL

  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <Navbar isAdmin={isAdmin} />
    </div>
  )
}
