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
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="font-semibold text-amber-800 mb-1">הטיה קוגניטיבית</p>
        <p className="text-gray-700">{card.content}</p>
      </div>
      {!revealed ? (
        <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>
          איך להימנע?
        </Button>
      ) : (
        <div className="bg-indigo-50 rounded-lg p-3 text-sm text-gray-700 border border-indigo-100">
          {card.explanation}
        </div>
      )}
    </CardWrapper>
  )
}
