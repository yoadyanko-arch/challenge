import { createClient } from '@/lib/supabase/server'
import { getPendingCards } from '@/lib/supabase/queries'
import AdminCardReview from './AdminCardReview'

export default async function QueuePage() {
  const supabase = await createClient()
  const cards = await getPendingCards(supabase)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">תור אישור ({cards.length} ממתינים)</h1>
      {cards.length === 0 && <p className="text-gray-400">אין כרטיסים ממתינים.</p>}
      {cards.map(card => (
        <AdminCardReview key={card.id} card={card} />
      ))}
    </div>
  )
}
