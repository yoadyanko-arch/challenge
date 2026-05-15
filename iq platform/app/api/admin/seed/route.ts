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

const ALL_PILLARS: Pillar[] = ['think', 'people', 'business', 'self']

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateOne(
  service: ReturnType<typeof import('@/lib/supabase/server').createServiceClient>,
  pillar: Pillar,
  topic: string,
  level: number,
  attempt = 1
): Promise<'ok' | 'fail'> {
  const type = TYPE_FOR_LEVEL[level - 1]
  const difficulty: Difficulty = level <= 3 ? 'easy' : level <= 7 ? 'medium' : 'hard'
  const xp_reward = level * 10
  try {
    const g = await generateCard(pillar, type, level, topic)
    const { error } = await service.from('cards').insert({
      pillar, type, difficulty, difficulty_level: level, topic,
      status: 'approved', xp_reward,
      title: g.title,
      content: g.content,
      question: g.question ?? null,
      explanation: g.explanation,
      options: g.options,
      correct_answer: g.correct_answer,
      source: g.source,
    })
    if (error) {
      if (attempt < 2) { await delay(2000); return generateOne(service, pillar, topic, level, 2) }
      return 'fail'
    }
    return 'ok'
  } catch {
    if (attempt < 2) { await delay(3000); return generateOne(service, pillar, topic, level, 2) }
    return 'fail'
  }
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!isAdmin(user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as { pillar?: Pillar; all?: boolean; topic?: string }
    const pillarsToRun = body.all ? ALL_PILLARS : body.pillar ? [body.pillar] : []
    if (pillarsToRun.length === 0) {
      return NextResponse.json({ error: 'Specify pillar or all:true' }, { status: 400 })
    }

    const service = createServiceClient()
    let created = 0
    let failed = 0

    for (const pillar of pillarsToRun) {
      const allTopics = PILLAR_TOPICS[pillar]
      const topics = body.topic
        ? allTopics.filter(t => t.value === body.topic)
        : allTopics

      // Build all tasks for this pillar
      const tasks: (() => Promise<void>)[] = []
      for (const topicObj of topics) {
        for (let level = 1; level <= 10; level++) {
          const lvl = level
          const t = topicObj.value
          tasks.push(async () => {
            const result = await generateOne(service, pillar, t, lvl)
            if (result === 'ok') created++
            else failed++
          })
        }
      }

      // Run 3 concurrent (safe rate limit margin)
      for (let i = 0; i < tasks.length; i += 3) {
        await Promise.all(tasks.slice(i, i + 3).map(fn => fn()))
        if (i + 3 < tasks.length) await delay(1500)
      }
    }

    return NextResponse.json({ created, failed })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
