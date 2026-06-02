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
