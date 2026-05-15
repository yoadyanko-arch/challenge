import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from './prompts'
import type { Pillar, CardType } from '@/types'

const client = new Anthropic()

export interface GeneratedCard {
  title: string
  content: string
  question: string | null
  explanation: string
  options: string[] | null
  correct_answer: string | null
  source: string | null
}

export async function generateCard(
  pillar: Pillar,
  type: CardType,
  difficulty_level: number,
  topic?: string
): Promise<GeneratedCard> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(pillar, type, difficulty_level, topic) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text) as GeneratedCard
  return parsed
}

export async function generateBatch(
  pillar: Pillar,
  type: CardType,
  difficulty_level: number,
  count: number,
  topic?: string
): Promise<GeneratedCard[]> {
  const results = await Promise.all(
    Array.from({ length: count }, () => generateCard(pillar, type, difficulty_level, topic))
  )
  return results
}
