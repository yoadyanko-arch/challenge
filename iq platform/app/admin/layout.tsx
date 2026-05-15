export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, Settings, ArrowRight, Library, Zap } from 'lucide-react'
import { isAdmin } from '@/lib/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!isAdmin(user?.email)) {
    redirect('/feed')
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <Settings size={13} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight">ניהול</span>
        </div>

        <nav className="flex items-center gap-1 mr-2">
          <Link
            href="/admin/generate"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LayoutGrid size={13} />
            ייצור פרטני
          </Link>
          <Link
            href="/admin/cards"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Library size={13} />
            כרטיסים
          </Link>
          <Link
            href="/admin/seed"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Zap size={13} />
            ייצור מסיבי
          </Link>
        </nav>

        <Link
          href="/feed"
          className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={13} />
          חזרה לפיד
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
