import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateBatch } from '@/lib/claude/generate'
import type { Pillar, CardType, Difficulty } from '@/types'
import { isAdmin } from '@/lib/admin'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export async function POST(req: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { pillar, type, topic } = await req.json() as {
    pillar: Pillar
    type: CardType
    topic?: string
  }

  if (!pillar || !type) {
    return NextResponse.json({ error: 'pillar and type are required' }, { status: 400 })
  }

  let generated: Awaited<ReturnType<typeof generateBatch>>
  let debugError: string | undefined
  try {
    generated = await generateBatch(pillar, type, LEVELS, topic)
  } catch (err) {
    debugError = String(err)
    generated = []
  }

  const cards = generated.map(({ card, level }) => {
    const difficulty: Difficulty =
      level <= 3 ? 'easy' : level <= 7 ? 'medium' : 'hard'
    return {
      pillar,
      type,
      difficulty,
      difficulty_level: level,
      topic: topic ?? null,
      status: 'approved',
      xp_reward: level * 10,
      title: card.title,
      content: card.content,
      question: card.question ?? null,
      explanation: card.explanation,
      options: card.options,
      correct_answer: card.correct_answer,
      source: card.source,
    }
  })

  if (cards.length === 0) {
    return NextResponse.json({ error: debugError ?? 'כל הבקשות נכשלו, נסה שוב' }, { status: 500 })
  }

  const service = createServiceClient()
  const { data, error } = await service.from('cards').insert(cards).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ created: data.length })
}
