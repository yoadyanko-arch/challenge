'use client'
import { useState, useCallback } from 'react'
import CardConcept from '@/components/cards/CardConcept'
import CardScenario from '@/components/cards/CardScenario'
import CardChallenge from '@/components/cards/CardChallenge'
import CardBias from '@/components/cards/CardBias'
import type { Card, Pillar } from '@/types'

interface Props {
  initialCards: Card[]
  pillar: Pillar | 'all'
}

export default function FeedScroller({ initialCards, pillar }: Props) {
  const [cards] = useState(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const handleComplete = useCallback(async (cardId: string, xpEarned: number) => {
    if (completedIds.has(cardId)) return
    setCompletedIds(prev => new Set([...prev, cardId]))

    const card = cards.find(c => c.id === cardId)!
    await fetch('/api/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId, xpEarned,
        wasCorrect: xpEarned > 0,
        pillar: card.pillar,
      }),
    })

    setCurrentIndex(i => Math.min(i + 1, cards.length - 1))
  }, [cards, completedIds])

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        אין כרטיסים זמינים
      </div>
    )
  }

  const card = cards[currentIndex]
  const props = { card, onComplete: handleComplete }

  return (
    <div className="py-4">
      <div className="text-center text-xs text-gray-400 mb-3">
        {currentIndex + 1} / {cards.length}
      </div>
      {card.type === 'concept' && <CardConcept {...props} />}
      {card.type === 'scenario' && <CardScenario {...props} />}
      {card.type === 'challenge' && <CardChallenge {...props} />}
      {card.type === 'bias' && <CardBias {...props} />}
    </div>
  )
}
