import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from './prompts'
import type { Pillar, CardType } from '@/types'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

export interface GeneratedCard {
  title: string
  content: string
  question: string | null
  explanation: string
  options: string[] | null
  correct_answer: string | null
  source: string | null
}

export function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (fenceMatch) return fenceMatch[1].trim()
  return text.trim()
}

export async function generateCard(
  pillar: Pillar,
  type: CardType,
  difficulty_level: number,
  topic?: string
): Promise<GeneratedCard> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(pillar, type, difficulty_level, topic) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return JSON.parse(extractJSON(text)) as GeneratedCard
}

export async function generateBatch(
  pillar: Pillar,
  type: CardType,
  levels: number[],
  topic?: string
): Promise<Array<{ card: GeneratedCard; level: number }>> {
  const results = await Promise.allSettled(
    levels.map(level =>
      generateCard(pillar, type, level, topic).then(card => ({ card, level }))
    )
  )
  return results
    .filter(
      (r): r is PromiseFulfilledResult<{ card: GeneratedCard; level: number }> =>
        r.status === 'fulfilled'
    )
    .map(r => r.value)
}
