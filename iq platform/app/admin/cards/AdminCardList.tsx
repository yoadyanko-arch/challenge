'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS } from '@/types'
import type { Card } from '@/types'
import { Trash2 } from 'lucide-react'

export default function AdminCardList({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState(initialCards)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('למחוק את הכרטיס הזה לצמיתות?')) return
    setDeleting(id)
    const res = await fetch(`/api/cards/${id}/delete`, { method: 'POST' })
    if (res.ok) {
      setCards(prev => prev.filter(c => c.id !== id))
    }
    setDeleting(null)
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        אין כרטיסים מאושרים
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cards.map(card => (
        <div key={card.id} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                {PILLAR_LABELS[card.pillar]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                {card.type}
              </span>
              <span className="text-sm font-semibold truncate">{card.title}</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(card.id)}
              disabled={deleting === card.id}
              className="shrink-0 gap-1.5 h-8"
            >
              <Trash2 size={13} />
              {deleting === card.id ? 'מוחק...' : 'מחק'}
            </Button>
          </div>
          <div className="px-4 pb-3">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{card.content}</p>
            {card.source && (
              <p className="text-xs text-primary/70 font-medium mt-1.5">מקור: {card.source}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
