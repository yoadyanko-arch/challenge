import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from './prompts'
import type { Pillar, CardType, Difficulty } from '@/types'

const client = new Anthropic()

export interface GeneratedCard {
  title: string
  content: string
  explanation: string
  options: string[] | null
  correct_answer: string | null
  source: string | null
}

export async function generateCard(
  pillar: Pillar,
  type: CardType,
  difficulty: Difficulty,
  topic?: string
): Promise<GeneratedCard> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(pillar, type, difficulty, topic) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text) as GeneratedCard
  return parsed
}

export async function generateBatch(
  pillar: Pillar,
  type: CardType,
  difficulty: Difficulty,
  count: number,
  topic?: string
): Promise<GeneratedCard[]> {
  const results = await Promise.all(
    Array.from({ length: count }, () => generateCard(pillar, type, difficulty, topic))
  )
  return results
}
