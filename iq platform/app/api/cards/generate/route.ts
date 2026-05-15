import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateBatch } from '@/lib/claude/generate'
import type { Pillar, CardType, Difficulty } from '@/types'
import { isAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { pillar, type, difficulty_level = 5, topic, count = 5 } = await req.json() as {
    pillar: Pillar; type: CardType; difficulty_level: number; topic?: string; count?: number
  }

  const difficulty: Difficulty =
    difficulty_level <= 3 ? 'easy' : difficulty_level <= 7 ? 'medium' : 'hard'
  const xp_reward = difficulty_level <= 3 ? 10 : difficulty_level <= 7 ? 20 : 30

  const generated = await generateBatch(pillar, type, difficulty_level, Math.min(count, 20), topic)

  const cards = generated.map(({ title, content, question, explanation, options, correct_answer, source }) => ({
    pillar,
    type,
    difficulty,
    difficulty_level,
    topic: topic ?? null,
    status: 'approved',
    xp_reward,
    title,
    content,
    question: question ?? null,
    explanation,
    options,
    correct_answer,
    source,
  }))

  const service = createServiceClient()
  const { data, error } = await service.from('cards').insert(cards).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ created: data.length })
}
