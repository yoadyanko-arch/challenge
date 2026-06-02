'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS } from '@/types'
import type { Card } from '@/types'
import { Check, X } from 'lucide-react'

export default function AdminCardReview({ card }: { card: Card }) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch(`/api/cards/${card.id}/${action}`, { method: 'POST' })
    setStatus(action === 'approve' ? 'approved' : 'rejected')
    setLoading(false)
  }

  if (status !== 'pending') {
    return (
      <div className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
        status === 'approved'
          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
          : 'bg-destructive/10 border-destructive/30 text-destructive'
      }`}>
        {status === 'approved' ? <Check size={14} /> : <X size={14} />}
        {status === 'approved' ? 'אושר' : 'נדחה'} — {card.title}
      </div>
    )
  }

  const difficultyLabel = card.difficulty === 'easy' ? 'קל' : card.difficulty === 'medium' ? 'בינוני' : 'קשה'

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
          {PILLAR_LABELS[card.pillar]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
          {card.type}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
          {difficultyLabel}
        </span>
      </div>

      <div className="px-4 py-4 space-y-3">
        <h3 className="font-semibold text-sm">{card.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{card.content}</p>

        {card.options && (
          <ul className="space-y-1.5">
            {(card.options as string[]).map((o, i) => (
              <li
                key={i}
                className={`text-sm px-3 py-2 rounded-lg border ${
                  o === card.correct_answer
                    ? 'border-emerald-700 bg-emerald-950/30 text-emerald-400 font-medium'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {o === card.correct_answer && <span className="ml-1">✓ </span>}
                {o}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground italic leading-relaxed border-r-2 border-primary/30 pr-3">
          {card.explanation}
        </p>
        {card.source && (
          <p className="text-xs text-primary/70 font-medium">
            מקור: {card.source}
          </p>
        )}
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAction('approve')}
          disabled={loading}
          className="gap-1.5"
        >
          <Check size={13} />
          אשר
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="gap-1.5"
        >
          <X size={13} />
          דחה
        </Button>
      </div>
    </div>
  )
}
