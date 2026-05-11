'use client'
import { useState } from 'react'
import CardWrapper from './CardWrapper'
import { Button } from '@/components/ui/button'
import type { Card } from '@/types'
import { XP_VALUES } from '@/types'

export default function CardBias({ card, onComplete }: { card: Card; onComplete: (id: string, xp: number) => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <CardWrapper card={card} onComplete={onComplete} xpEarned={revealed ? XP_VALUES[card.difficulty] : undefined} showNext={revealed}>
      <div className="bg-accent border border-primary/20 rounded-xl p-4">
        <p className="font-semibold text-accent-foreground text-xs uppercase tracking-wide mb-2">הטיה קוגניטיבית</p>
        <p className="text-foreground/80 text-sm">{card.content}</p>
      </div>
      {!revealed ? (
        <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>
          איך להימנע?
        </Button>
      ) : (
        <div className="bg-accent rounded-xl p-4 text-sm text-foreground border border-primary/20">
          {card.explanation}
        </div>
      )}
    </CardWrapper>
  )
}
