import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateCard } from '@/lib/claude/generate'
import { isAdmin } from '@/lib/admin'
import { PILLAR_TOPICS, type Pillar, type CardType, type Difficulty } from '@/types'

export const maxDuration = 300

const TYPE_FOR_LEVEL: CardType[] = [
  'concept',   // 1
  'concept',   // 2
  'scenario',  // 3
  'scenario',  // 4
  'challenge', // 5
  'challenge', // 6
  'scenario',  // 7
  'bias',      // 8
  'challenge', // 9
  'scenario',  // 10
]

export async function POST(req: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { pillar } = await req.json() as { pillar: Pillar }
  const topics = PILLAR_TOPICS[pillar]
  if (!topics) return NextResponse.json({ error: 'Invalid pillar' }, { status: 400 })

  const service = createServiceClient()
  let created = 0
  let failed = 0

  const tasks: (() => Promise<void>)[] = []

  for (const topicObj of topics) {
    for (let level = 1; level <= 10; level++) {
      const lvl = level
      const type = TYPE_FOR_LEVEL[lvl - 1]
      const difficulty: Difficulty = lvl <= 3 ? 'easy' : lvl <= 7 ? 'medium' : 'hard'
      const xp_reward = lvl <= 3 ? 10 : lvl <= 7 ? 20 : 30

      tasks.push(async () => {
        try {
          const g = await generateCard(pillar, type, lvl, topicObj.value)
          const { error } = await service.from('cards').insert({
            pillar,
            type,
            difficulty,
            difficulty_level: lvl,
            topic: topicObj.value,
            status: 'approved',
            xp_reward,
            title: g.title,
            content: g.content,
            question: g.question ?? null,
            explanation: g.explanation,
            options: g.options,
            correct_answer: g.correct_answer,
            source: g.source,
          })
          if (!error) created++
          else failed++
        } catch {
          failed++
        }
      })
    }
  }

  // Run 5 concurrent at a time
  for (let i = 0; i < tasks.length; i += 5) {
    await Promise.all(tasks.slice(i, i + 5).map(fn => fn()))
  }

  return NextResponse.json({ created, failed, total: topics.length * 10 })
}
