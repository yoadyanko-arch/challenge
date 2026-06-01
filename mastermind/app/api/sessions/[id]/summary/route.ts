import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { PILLAR_LABELS, type Pillar, type StoredCardResult } from '@/types'

const anthropic = new Anthropic()

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  const { data: session } = await service
    .from('learned_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (session.ai_summary) {
    return NextResponse.json({ summary: session.ai_summary })
  }

  const pillarLabel =
    session.pillar === 'mix'
      ? 'מיקס'
      : PILLAR_LABELS[session.pillar as Pillar] ?? session.pillar

  const cardsList = (session.cards_data as StoredCardResult[])
    .map(c => `- ${c.card_title}: ${c.explanation}`)
    .join('\n')

  const prompt = `אתה כותב רשומת יומן למידה קצרה בעברית.
המשתמש סיים סשן Mastermind בנושא: ${pillarLabel}${session.topic ? ` / ${session.topic}` : ''}.
הכרטיסים שלמד:
${cardsList}

כתוב 2-3 משפטים בעברית שמסכמים מה המשתמש למד היום, כאילו אתה כותב בשמו ביומן אישי. היה חם וספציפי לתכנים שלמד.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const aiSummary =
    message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  await service
    .from('learned_sessions')
    .update({ ai_summary: aiSummary })
    .eq('id', id)

  return NextResponse.json({ summary: aiSummary })
}
