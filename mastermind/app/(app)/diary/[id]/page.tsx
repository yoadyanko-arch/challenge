'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()

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
          <p className="text-xs font-medium text-primary">
            {pillarLabel}{session.topic ? ` › ${session.topic}` : ''}
          </p>
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
