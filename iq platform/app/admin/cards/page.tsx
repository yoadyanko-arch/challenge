import { createServiceClient } from '@/lib/supabase/server'
import AdminCardList from './AdminCardList'
import type { Card } from '@/types'

export default async function CardsPage() {
  const supabase = createServiceClient()
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight">כרטיסים מאושרים</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{cards?.length ?? 0} כרטיסים פעילים בפיד</p>
      </div>
      <AdminCardList initialCards={(cards ?? []) as Card[]} />
    </div>
  )
}
