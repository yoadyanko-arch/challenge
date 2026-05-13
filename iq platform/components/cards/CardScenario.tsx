'use client'
import { useState } from 'react'
import CardWrapper from './CardWrapper'
import type { Card } from '@/types'
import { XP_VALUES } from '@/types'

export default function CardScenario({ card, onComplete }: { card: Card; onComplete: (id: string, xp: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const options = card.options ?? []
  const correctIndex = options.indexOf(card.correct_answer ?? '')
  const isCorrect = selected === correctIndex

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
  }

  const xp = selected !== null ? (isCorrect ? XP_VALUES[card.difficulty] + 5 : Math.floor(XP_VALUES[card.difficulty] / 2)) : undefined

  return (
    <CardWrapper card={card} onComplete={onComplete} xpEarned={xp} showNext={selected !== null}>
      <p className="text-foreground/80 leading-relaxed text-sm">{card.content}</p>
      {card.question && (
        <p className="font-semibold text-sm text-foreground">{card.question}</p>
      )}
      <div className="space-y-2">
        {options.map((option, i) => {
          let cls = 'w-full text-right p-3 rounded-xl border text-sm transition-all font-medium'
          if (selected !== null) {
            if (i === correctIndex) cls += ' border-emerald-500 bg-emerald-50 text-emerald-800'
            else if (i === selected && !isCorrect) cls += ' border-destructive/60 bg-destructive/5 text-destructive'
            else cls += ' border-border text-muted-foreground opacity-50'
          } else {
            cls += ' border-border hover:border-primary hover:bg-accent cursor-pointer'
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} className={cls}>
              {option}
            </button>
          )
        })}
      </div>
      {selected !== null && (
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
