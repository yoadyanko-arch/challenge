'use client'
import { useState } from 'react'
import CardWrapper from './CardWrapper'
import { Button } from '@/components/ui/button'
import type { Card } from '@/types'
import { XP_VALUES } from '@/types'

export default function CardConcept({ card, onComplete }: { card: Card; onComplete: (id: string, xp: number) => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <CardWrapper card={card} onComplete={onComplete} xpEarned={revealed ? XP_VALUES[card.difficulty] : undefined} showNext={revealed}>
      <p className="text-foreground/80 leading-relaxed text-sm">{card.content}</p>
      {card.question && (
        <p className="font-semibold text-sm text-foreground">{card.question}</p>
      )}
      {!revealed ? (
        <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>
          הצג הסבר
        </Button>
      ) : (
        <>
          <div className="bg-accent rounded-xl p-4 text-sm text-foreground border border-primary/20">
            {card.explanation}
          </div>
          {card.source && (
            <p className="text-xs text-muted-foreground border-r-2 border-border pr-3">
              מקור: {card.source}
            </p>
          )}
        </>
      )}
    </CardWrapper>
  )
}
