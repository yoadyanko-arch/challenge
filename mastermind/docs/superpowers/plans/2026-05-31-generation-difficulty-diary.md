# Generation Fix, Difficulty Spread & Learning Diary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix card generation JSON parsing errors, spread difficulty across all 10 levels per batch, and add a per-session learning diary page with an AI-generated narrative summary.

**Architecture:** Three independent workstreams sharing the same session data model. The diary is a new client-side page (`/diary/[id]`) backed by a new API route that calls Claude and caches the result in `learned_sessions.ai_summary`. Generation fixes are isolated to `lib/claude/generate.ts` and the admin route. Difficulty spread changes `generateBatch`'s signature from a single level + count to an array of levels.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + RLS), Anthropic SDK, Vitest, TypeScript

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `lib/claude/generate.ts` | Modify | Add `extractJSON`, update `generateBatch` to accept `levels[]`, use `allSettled` |
| `lib/claude/generate.test.ts` | Create | Unit tests for `extractJSON` |
| `app/api/cards/generate/route.ts` | Modify | Pass `[1..10]` levels array, remove count param |
| `app/api/cards/game/route.ts` | Modify | Remove difficulty ordering, shuffle in JS |
| `app/admin/generate/page.tsx` | Modify | Remove count and difficulty_level controls |
| `types/index.ts` | Modify | Add `ai_summary?: string \| null` to `LearnedSession` |
| `components/game/SessionSummary.tsx` | Modify | Store returned session ID, add "פתח יומן" button |
| `components/game/LearnedSessionCard.tsx` | Modify | Add "יומן" link to `/diary/[id]` |
| `app/(app)/diary/[id]/page.tsx` | Create | Client-side diary page with loading state |
| `app/api/sessions/[id]/summary/route.ts` | Create | POST — generate + cache AI summary |

---

### Task 1: Fix JSON extraction in generate.ts

**Files:**
- Modify: `lib/claude/generate.ts`
- Create: `lib/claude/generate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/claude/generate.test.ts`:

```ts
import { extractJSON } from './generate'

describe('extractJSON', () => {
  it('returns plain text as-is', () => {
    const input = '{"title":"test","content":"hello"}'
    expect(extractJSON(input)).toBe(input)
  })

  it('extracts from ```json fence', () => {
    const input = '```json\n{"title":"test","content":"hello"}\n```'
    expect(extractJSON(input)).toBe('{"title":"test","content":"hello"}')
  })

  it('extracts from plain ``` fence', () => {
    const input = '```\n{"title":"test"}\n```'
    expect(extractJSON(input)).toBe('{"title":"test"}')
  })

  it('trims surrounding whitespace', () => {
    const input = '  {"title":"test"}  '
    expect(extractJSON(input)).toBe('{"title":"test"}')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run lib/claude/generate.test.ts
```

Expected: FAIL — `extractJSON is not exported`

- [ ] **Step 3: Add `extractJSON` to generate.ts and fix generateBatch**

Replace the full contents of `lib/claude/generate.ts` with:

```ts
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
  const message = await client.messages.create({
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
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx vitest run lib/claude/generate.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/claude/generate.ts lib/claude/generate.test.ts
git commit -m "fix: extract JSON from markdown fences, allSettled in generateBatch"
```

---

### Task 2: Update admin generate route to use levels array

**Files:**
- Modify: `app/api/cards/generate/route.ts`

- [ ] **Step 1: Replace the route**

Replace full contents of `app/api/cards/generate/route.ts`:

```ts
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

  const generated = await generateBatch(pillar, type, LEVELS, topic)

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

  const service = createServiceClient()
  const { data, error } = await service.from('cards').insert(cards).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ created: data.length })
}
```

- [ ] **Step 2: Update the admin generate UI to remove count/difficulty controls**

Replace full contents of `app/admin/generate/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PILLAR_LABELS, PILLAR_TOPICS, type Pillar, type CardType } from '@/types'
import { Sparkles } from 'lucide-react'

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'concept', label: 'מושג' },
  { value: 'scenario', label: 'תרחיש' },
  { value: 'challenge', label: 'אתגר' },
  { value: 'bias', label: 'הטיות' },
]

export default function GeneratePage() {
  const [pillar, setPillar] = useState<Pillar>('think')
  const [type, setType] = useState<CardType>('concept')
  const [topic, setTopic] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const topics = PILLAR_TOPICS[pillar]

  async function generate() {
    setLoading(true)
    setResult('')
    const res = await fetch('/api/cards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillar, type, topic: topic || undefined }),
    })
    const data = await res.json()
    setResult(
      data.created
        ? `נוצרו ${data.created} כרטיסים (רמות 1–10).`
        : data.error
    )
    setLoading(false)
  }

  const selectCls =
    'w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">ייצור תוכן</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          יוצר 10 כרטיסים — אחד לכל רמת קושי (1–10)
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">עמודה</Label>
            <select
              className={selectCls}
              value={pillar}
              onChange={e => {
                setPillar(e.target.value as Pillar)
                setTopic('')
              }}
            >
              {(Object.keys(PILLAR_LABELS) as Pillar[]).map(p => (
                <option key={p} value={p}>{PILLAR_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">נושא</Label>
            <select className={selectCls} value={topic} onChange={e => setTopic(e.target.value)}>
              <option value="">כללי</option>
              {topics.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs text-muted-foreground">סוג כרטיס</Label>
            <select
              className={selectCls}
              value={type}
              onChange={e => setType(e.target.value as CardType)}
            >
              {CARD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full gap-2">
        <Sparkles size={15} />
        {loading ? 'מייצר 10 כרטיסים...' : 'ייצר 10 כרטיסים (רמות 1–10)'}
      </Button>

      {result && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            result.includes('נוצרו')
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {result}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/cards/generate/route.ts app/admin/generate/page.tsx
git commit -m "feat: generate batch always creates 10 cards across all difficulty levels"
```

---

### Task 3: Randomise game card order

**Files:**
- Modify: `app/api/cards/game/route.ts`

- [ ] **Step 1: Replace the route with shuffle instead of difficulty ordering**

Replace full contents of `app/api/cards/game/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const pillar = url.searchParams.get('pillar')
  const topic = url.searchParams.get('topic') || null

  let query = supabase
    .from('cards')
    .select('*')
    .eq('status', 'approved')
    .limit(15)

  if (pillar && pillar !== 'mix') query = query.eq('pillar', pillar)
  if (topic) query = query.eq('topic', topic)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5)
  return NextResponse.json({ cards: shuffled })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/cards/game/route.ts
git commit -m "fix: shuffle game cards instead of always ordering easiest first"
```

---

### Task 4: Add ai_summary to LearnedSession type + DB migration

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Update LearnedSession interface**

In `types/index.ts`, find the `LearnedSession` interface (lines 40–48) and replace it with:

```ts
export interface LearnedSession {
  id: string
  user_id: string
  pillar: string
  topic: string | null
  score: number
  cards_data: StoredCardResult[]
  completed_at: string
  ai_summary?: string | null
}
```

- [ ] **Step 2: Run the DB migration in Supabase**

Go to your Supabase project → SQL Editor and run:

```sql
ALTER TABLE learned_sessions ADD COLUMN IF NOT EXISTS ai_summary TEXT;
```

- [ ] **Step 3: Commit the type change**

```bash
git add types/index.ts
git commit -m "feat: add ai_summary field to LearnedSession type"
```

---

### Task 5: Create AI summary API endpoint

**Files:**
- Create: `app/api/sessions/[id]/summary/route.ts`

- [ ] **Step 1: Create the route file**

Create `app/api/sessions/[id]/summary/route.ts`:

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/sessions/[id]/summary/route.ts
git commit -m "feat: add AI summary generation endpoint for learning diary"
```

---

### Task 6: Create the diary page

**Files:**
- Create: `app/(app)/diary/[id]/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/(app)/diary/[id]/page.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  PILLAR_LABELS,
  type Pillar,
  type LearnedSession,
  type StoredCardResult,
} from '@/types'
import { CheckCircle2, XCircle, BookOpen, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DiaryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [session, setSession] = useState<LearnedSession | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase
      .from('learned_sessions')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setPageLoading(false)
        if (!data) return
        setSession(data as LearnedSession)
        if (data.ai_summary) {
          setSummary(data.ai_summary)
        } else {
          setSummaryLoading(true)
          fetch(`/api/sessions/${id}/summary`, { method: 'POST' })
            .then(r => r.json())
            .then(({ summary: s }) => { if (s) setSummary(s) })
            .finally(() => setSummaryLoading(false))
        }
      })
  }, [id])

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <p className="text-muted-foreground text-sm">הסשן לא נמצא</p>
        <Button variant="outline" onClick={() => router.push('/profile')}>
          חזור לפרופיל
        </Button>
      </div>
    )
  }

  const pillarLabel =
    session.pillar === 'mix'
      ? 'מיקס'
      : PILLAR_LABELS[session.pillar as Pillar] ?? session.pillar

  const date = new Date(session.completed_at).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/profile')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowRight size={14} />
          פרופיל
        </button>
        <div className="text-right">
          <p className="text-xs font-medium text-primary">{pillarLabel}{session.topic ? ` › ${session.topic}` : ''}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight mb-3">יומן למידה</h1>
        <div className="bg-card border border-primary/20 rounded-2xl p-5 min-h-[80px]">
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={14} className="animate-spin" />
              כותב סיכום...
            </div>
          ) : summary ? (
            <p className="text-sm leading-relaxed text-foreground">{summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">לא ניתן לטעון סיכום כרגע</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          מה למדתי ({session.cards_data.length} כרטיסים)
        </h2>
        {session.cards_data.map((result: StoredCardResult, i: number) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {result.was_correct === true ? (
                  <CheckCircle2 size={15} className="text-emerald-400" />
                ) : result.was_correct === false ? (
                  <XCircle size={15} className="text-destructive" />
                ) : (
                  <BookOpen size={15} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{result.card_title}</p>
                {result.was_correct === false && result.correct_answer && (
                  <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                    תשובה נכונה: {result.correct_answer}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={() => router.push('/profile')}>
        חזור לפרופיל
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/diary/[id]/page.tsx"
git commit -m "feat: add learning diary page with AI summary"
```

---

### Task 7: Update SessionSummary to show "פתח יומן" button

**Files:**
- Modify: `components/game/SessionSummary.tsx`

- [ ] **Step 1: Replace SessionSummary**

Replace full contents of `components/game/SessionSummary.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS, type Pillar, type StoredCardResult } from '@/types'
import { CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react'

interface SessionSummaryProps {
  results: StoredCardResult[]
  score: number
  pillar: Pillar | 'mix'
  topic: string | null
  onDone: () => void
}

export default function SessionSummary({ results, score, pillar, topic, onDone }: SessionSummaryProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const correctCount = results.filter(r => r.was_correct === true).length
  const wrongCount = results.filter(r => r.was_correct === false).length
  const biasCount = results.filter(r => r.was_correct === null).length

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillar: pillar === 'mix' ? 'mix' : pillar,
          topic,
          score,
          cards_data: results,
        }),
      })
      const data = await res.json()
      if (data.id) setSessionId(data.id)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="text-center space-y-1 pt-2">
        <h1 className="text-2xl font-bold tracking-tight">אז מה למדנו?</h1>
        <p className="text-sm text-muted-foreground">
          {pillar === 'mix' ? 'מיקס' : PILLAR_LABELS[pillar as Pillar]}
          {topic && ` › ${topic}`}
        </p>
      </div>

      <div className="bg-card border border-primary/30 rounded-2xl p-6 text-center">
        <p className="text-4xl font-bold text-primary">{score}</p>
        <p className="text-sm text-muted-foreground mt-1">נקודות</p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-400">{correctCount}</p>
            <p className="text-xs text-muted-foreground">נכון</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-destructive">{wrongCount}</p>
            <p className="text-xs text-muted-foreground">שגוי</p>
          </div>
          {biasCount > 0 && (
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{biasCount}</p>
              <p className="text-xs text-muted-foreground">הטיות</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {result.was_correct === true ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : result.was_correct === false ? (
                  <XCircle size={16} className="text-destructive" />
                ) : (
                  <BookOpen size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{result.card_title}</p>
                {result.card_question && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {result.card_question}
                  </p>
                )}
                {result.was_correct === false && result.correct_answer && (
                  <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                    תשובה נכונה: {result.correct_answer}
                  </p>
                )}
                {result.xp_earned > 0 && (
                  <p className="text-xs text-primary mt-1">+{result.xp_earned} נקודות</p>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5 mt-0.5">
                <Clock size={9} />
                {result.time_spent}s
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        {!saved ? (
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'שומר...' : 'שמור בפרופיל'}
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-emerald-400 font-medium py-1">
              הסשן נשמר בפרופיל שלך
            </p>
            {sessionId && (
              <Button
                className="w-full"
                onClick={() => router.push(`/diary/${sessionId}`)}
              >
                פתח יומן למידה →
              </Button>
            )}
          </>
        )}
        <Button variant="outline" className="w-full" onClick={onDone}>
          שחק שוב
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/SessionSummary.tsx
git commit -m "feat: show 'open diary' button in session summary after save"
```

---

### Task 8: Add diary link in LearnedSessionCard

**Files:**
- Modify: `components/game/LearnedSessionCard.tsx`

- [ ] **Step 1: Add import and "יומן" link**

In `components/game/LearnedSessionCard.tsx`, add the Link import and a button in the header row.

Replace full contents of `components/game/LearnedSessionCard.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import { PILLAR_LABELS, type Pillar, type LearnedSession } from '@/types'

export default function LearnedSessionCard({ session }: { session: LearnedSession }) {
  const [open, setOpen] = useState(false)

  const date = new Date(session.completed_at).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const correctCount = session.cards_data.filter(r => r.was_correct === true).length
  const totalMCQ = session.cards_data.filter(r => r.was_correct !== null).length
  const pillarLabel =
    session.pillar === 'mix'
      ? 'מיקס'
      : PILLAR_LABELS[session.pillar as Pillar] ?? session.pillar

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="w-full px-4 py-3 flex items-center justify-between gap-3 text-right">
        <button
          className="flex-1 min-w-0 text-right"
          onClick={() => setOpen(o => !o)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              {pillarLabel}
            </span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-primary">{session.score} נקודות</span>
            {totalMCQ > 0 && (
              <span className="text-xs text-muted-foreground">
                {correctCount}/{totalMCQ} נכון
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {session.cards_data.length} כרטיסים
            </span>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/diary/${session.id}`}
            className="text-xs text-primary hover:underline underline-offset-2"
            onClick={e => e.stopPropagation()}
          >
            יומן
          </Link>
          <button onClick={() => setOpen(o => !o)}>
            {open
              ? <ChevronUp size={16} className="text-muted-foreground" />
              : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border divide-y divide-border/50">
          {session.cards_data.map((result, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {result.was_correct === true ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : result.was_correct === false ? (
                  <XCircle size={14} className="text-destructive" />
                ) : (
                  <BookOpen size={14} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{result.card_title}</p>
                {result.was_correct === false && result.correct_answer && (
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    נכון: {result.correct_answer}
                  </p>
                )}
              </div>
              {result.xp_earned > 0 && (
                <p className="text-[11px] text-primary shrink-0">+{result.xp_earned}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/LearnedSessionCard.tsx
git commit -m "feat: add diary link to each session card in profile"
```

---

## Self-Review

**Spec coverage:**
- ✅ JSON parse fix → Task 1 (`extractJSON` + `allSettled`)
- ✅ Difficulty spread 1–10 → Task 2 (generate route + admin UI)
- ✅ Random game order → Task 3
- ✅ DB migration → Task 4
- ✅ AI summary endpoint → Task 5
- ✅ Diary page → Task 6
- ✅ "פתח יומן" in SessionSummary → Task 7
- ✅ "יומן" link in LearnedSessionCard → Task 8

**Placeholder scan:** No TBD, no "handle edge cases", no incomplete steps. All code is complete.

**Type consistency:**
- `generateBatch` returns `Array<{ card: GeneratedCard; level: number }>` — used consistently in Task 1 (definition) and Task 2 (generate route consumption).
- `sessionId` state in SessionSummary (Task 7) matches what `/api/sessions` POST returns (`{ id: string }`).
- `ai_summary` field added to `LearnedSession` type (Task 4) and used in diary page (Task 6) and summary route (Task 5).
- `params` in the summary route uses `Promise<{ id: string }>` pattern required by Next.js 15 dynamic route handlers.
