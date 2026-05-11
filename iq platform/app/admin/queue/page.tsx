import { createServiceClient } from '@/lib/supabase/server'
import { getPendingCards } from '@/lib/supabase/queries'
import AdminCardReview from './AdminCardReview'

export default async function QueuePage() {
  const supabase = createServiceClient()
  const cards = await getPendingCards(supabase)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight">תור אישור</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{cards.length} כרטיסים ממתינים לאישור</p>
      </div>
      {cards.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          אין כרטיסים ממתינים
        </div>
      )}
      <div className="space-y-3">
        {cards.map(card => (
          <AdminCardReview key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
