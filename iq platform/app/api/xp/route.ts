import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLevelFromXP } from '@/types'
import type { Pillar } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cardId, xpEarned, wasCorrect, pillar } = await req.json() as {
    cardId: string; xpEarned: number; wasCorrect: boolean; pillar: Pillar
  }

  await supabase.from('card_history').upsert({
    user_id: user.id, card_id: cardId, was_correct: wasCorrect, xp_earned: xpEarned
  })

  const [{ data: userRow }, { data: prog }] = await Promise.all([
    supabase.from('users').select('xp_total').eq('id', user.id).single(),
    supabase.from('progress').select('xp, cards_completed').eq('user_id', user.id).eq('pillar', pillar).single(),
  ])

  await supabase.from('users')
    .update({ xp_total: (userRow?.xp_total ?? 0) + xpEarned })
    .eq('id', user.id)

  if (prog) {
    const newXP = prog.xp + xpEarned
    await supabase.from('progress')
      .update({ xp: newXP, cards_completed: prog.cards_completed + 1, level: getLevelFromXP(newXP) })
      .eq('user_id', user.id)
      .eq('pillar', pillar)
  }

  return NextResponse.json({ ok: true })
}
