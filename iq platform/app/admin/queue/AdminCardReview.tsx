'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PILLAR_LABELS } from '@/types'
import type { Card } from '@/types'

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
      <div className={`p-3 rounded-xl border text-sm ${status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
        {status === 'approved' ? '✓ אושר' : '✗ נדחה'} — {card.title}
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge>{PILLAR_LABELS[card.pillar]}</Badge>
        <Badge variant="outline">{card.type}</Badge>
        <Badge variant="outline">{card.difficulty}</Badge>
      </div>
      <h3 className="font-semibold">{card.title}</h3>
      <p className="text-sm text-gray-600">{card.content}</p>
      {card.options && (
        <ul className="text-sm space-y-1">
          {(card.options as string[]).map((o, i) => (
            <li key={i} className={o === card.correct_answer ? 'text-green-700 font-medium' : 'text-gray-500'}>
              {o === card.correct_answer ? '✓ ' : ''}{o}
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-gray-500 italic">{card.explanation}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleAction('approve')} disabled={loading}>אשר</Button>
        <Button size="sm" variant="destructive" onClick={() => handleAction('reject')} disabled={loading}>דחה</Button>
      </div>
    </div>
  )
}
