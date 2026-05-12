import type { Pillar, CardType, Difficulty } from '@/types'

const PILLAR_CONTEXT: Record<Pillar, string> = {
  think: 'decision making, cognitive biases, logic, critical thinking, systems thinking, statistics',
  people: 'psychology, communication, persuasion, negotiation, leadership, social dynamics',
  business: 'business strategy, economics, investing, financial literacy, entrepreneurship, innovation',
  self: 'productivity, habits, focus, practical philosophy, self-improvement, time management',
}

const TYPE_INSTRUCTIONS: Record<CardType, string> = {
  concept: `Create a concept card with:
- "title": short concept name in Hebrew (3-6 words)
- "content": explanation of the concept in Hebrew (2-3 sentences, practical and clear)
- "explanation": a reflection question or real-world application in Hebrew (1-2 sentences)
- "options": null
- "correct_answer": null`,

  scenario: `Create a scenario card with:
- "title": short scenario title in Hebrew
- "content": a realistic business or life situation in Hebrew (3-4 sentences)
- "options": array of 4 answer options in Hebrew (strings)
- "correct_answer": the best option (must match one of options exactly)
- "explanation": explanation of why the answer is best in Hebrew (2-3 sentences)`,

  challenge: `Create a challenge card with:
- "title": short challenge title in Hebrew
- "content": a direct question (logical, economic, or psychological) in Hebrew
- "options": array of 4 answer options in Hebrew (strings)
- "correct_answer": the correct answer (must match one of options exactly)
- "explanation": step-by-step explanation in Hebrew (2-3 sentences)`,

  bias: `Create a cognitive bias spotlight card with:
- "title": bias name in Hebrew
- "content": what the bias is + a concrete real-life example in Hebrew (3-4 sentences)
- "explanation": practical advice on how to avoid this bias in Hebrew (2 sentences)
- "options": null
- "correct_answer": null`,
}

export function buildPrompt(pillar: Pillar, type: CardType, difficulty: Difficulty, topic?: string): string {
  const difficultyCtx = difficulty === 'easy' ? 'simple and accessible' : difficulty === 'medium' ? 'moderately complex' : 'advanced and nuanced'
  const topicCtx = topic ? ` Focus specifically on the sub-topic: "${topic}".` : ''

  return `You are creating content for Mastermind, a practical intelligence platform. Generate a single ${type} card about ${PILLAR_CONTEXT[pillar]}.${topicCtx}

Difficulty: ${difficultyCtx}

${TYPE_INSTRUCTIONS[type]}
- "source": a real, specific source the information is based on — a book, research paper, or study (e.g. "Daniel Kahneman, Thinking Fast and Slow (2011)" or "Cialdini, Influence: The Psychology of Persuasion (1984)"). If no specific source applies, use null.

Respond with ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "title": "...",
  "content": "...",
  "explanation": "...",
  "options": [...] or null,
  "correct_answer": "..." or null,
  "source": "..." or null
}`
}
