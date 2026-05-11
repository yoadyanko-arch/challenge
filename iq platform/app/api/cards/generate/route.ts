import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateBatch } from '@/lib/claude/generate'
import type { Pillar, CardType, Difficulty } from '@/types'
import { XP_VALUES } from '@/types'
import { isAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { pillar, type, difficulty, topic, count = 5 } = await req.json() as {
    pillar: Pillar; type: CardType; difficulty: Difficulty; topic?: string; count?: number
  }

  const generated = await generateBatch(pillar, type, difficulty, Math.min(count, 20), topic)

  const cards = generated.map(g => ({
    pillar,
    type,
    difficulty,
    topic: topic ?? null,
    status: 'pending',
    xp_reward: XP_VALUES[difficulty],
    ...g,
  }))

  const service = createServiceClient()
  const { data, error } = await service.from('cards').insert(cards).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ created: data.length })
}
