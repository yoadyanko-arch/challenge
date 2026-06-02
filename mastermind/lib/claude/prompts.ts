import type { Pillar, CardType } from '@/types'

const PILLAR_CONTEXT: Record<Pillar, string> = {
  think: 'decision making, cognitive biases, logic, critical thinking, systems thinking, statistics',
  people: 'psychology, communication, persuasion, negotiation, leadership, social dynamics',
  business: 'business strategy, economics, investing, financial literacy, entrepreneurship, innovation',
  self: 'productivity, habits, focus, practical philosophy, self-improvement, time management',
}

const TYPE_INSTRUCTIONS: Record<CardType, string> = {
  concept: `Create a concept knowledge card:
- "title": the concept name in Hebrew (2-5 words)
- "content": a 1-sentence hint or background about this concept in Hebrew (can be empty string "" if not needed)
- "question": a specific question testing knowledge of this concept in Hebrew (1 sentence, e.g. "מה מתאר המושג 'אפקט ההלה'?")
- "options": exactly 4 answer options in Hebrew — one correct, three plausible distractors
- "correct_answer": the correct option (must match one of options exactly)
- "explanation": explain the concept in Hebrew — why the answer is correct (2-3 sentences)`,

  scenario: `Create a scenario card:
- "title": short scenario title in Hebrew
- "content": a realistic business or life situation in Hebrew (3-4 sentences — describe the situation only, not the question)
- "question": a direct question in Hebrew asking what the user would do (1 sentence, e.g. "מה תעשה במצב זה?")
- "options": array of 4 answer options in Hebrew (strings)
- "correct_answer": the best option (must match one of options exactly)
- "explanation": explanation of why the answer is best in Hebrew (2-3 sentences)`,

  challenge: `Create a challenge card:
- "title": short challenge title in Hebrew
- "content": background context or setup in Hebrew (1-2 sentences — do NOT include the question here, can be empty string "")
- "question": the direct question to answer in Hebrew (1 sentence)
- "options": array of 4 answer options in Hebrew (strings)
- "correct_answer": the correct answer (must match one of options exactly)
- "explanation": step-by-step explanation in Hebrew (2-3 sentences)`,

  bias: `Create a cognitive bias spotlight card:
- "title": bias name in Hebrew
- "content": what the bias is + a concrete real-life example in Hebrew (3-4 sentences)
- "question": a personal reflection question about this bias in Hebrew (1 sentence, e.g. "מתי אחרון ההטיה הזו השפיעה על ההחלטות שלך?")
- "explanation": practical advice on how to recognize and avoid this bias in Hebrew (2 sentences)
- "options": null
- "correct_answer": null`,
}

export function buildPrompt(pillar: Pillar, type: CardType, difficulty_level: number, topic?: string): string {
  const difficultyCtx =
    difficulty_level <= 2 ? 'very basic and beginner-friendly — simple language, everyday examples, no jargon' :
    difficulty_level <= 4 ? 'simple and accessible — requires no prior knowledge' :
    difficulty_level <= 6 ? 'moderately complex — requires some familiarity with the topic' :
    difficulty_level <= 8 ? 'advanced — nuanced, assumes solid background knowledge' :
    'expert-level — highly nuanced, technical depth, challenging edge cases'

  const topicCtx = topic ? ` Focus specifically on the sub-topic: "${topic}".` : ''

  return `You are creating content for Mastermind, a practical intelligence platform. Generate a single ${type} card about ${PILLAR_CONTEXT[pillar]}.${topicCtx}

Difficulty: ${difficulty_level}/10 — ${difficultyCtx}

${TYPE_INSTRUCTIONS[type]}
- "source": REQUIRED. A real, specific book, research paper, or study the information is based on. Always provide one — never null. Examples: "Daniel Kahneman, Thinking Fast and Slow (2011)", "Robert Cialdini, Influence (1984)", "James Clear, Atomic Habits (2018)", "Amos Tversky & Daniel Kahneman, Judgment Under Uncertainty (1974)".

Respond with ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "title": "...",
  "content": "...",
  "question": "...",
  "explanation": "...",
  "options": [...] or null,
  "correct_answer": "..." or null,
  "source": "Author, Book Title (Year)"
}`
}
