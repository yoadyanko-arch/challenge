import { createServiceClient } from '@/lib/supabase/server'
import AdminCardsTree from './AdminCardsTree'
import type { Card } from '@/types'

export default async function CardsPage() {
  const supabase = createServiceClient()
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('status', 'approved')
    .order('difficulty_level', { ascending: true })

  const total = cards?.length ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight">כרטיסים מאושרים</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} כרטיסים פעילים — מסודרים לפי נושא</p>
      </div>
      <AdminCardsTree initialCards={(cards ?? []) as Card[]} />
    </div>
  )
}
