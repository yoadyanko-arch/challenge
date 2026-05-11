import { createClient } from '@/lib/supabase/server'
import { getApprovedCards } from '@/lib/supabase/queries'
import FeedScroller from '@/components/feed/FeedScroller'
import FeedHeader from '@/components/feed/FeedHeader'
import type { Pillar } from '@/types'

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ pillar?: string; topic?: string }> }) {
  const params = await searchParams
  const pillar = (params.pillar as Pillar) || undefined
  const topic = params.topic || undefined
  const supabase = await createClient()
  const cards = await getApprovedCards(supabase, pillar, topic, 30)

  return (
    <div className="max-w-lg mx-auto">
      <FeedHeader activePillar={pillar ?? 'all'} activeTopic={topic} />
      <FeedScroller initialCards={cards} pillar={pillar ?? 'all'} />
    </div>
  )
}
