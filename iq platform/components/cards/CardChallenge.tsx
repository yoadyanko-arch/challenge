'use client'
import { useState } from 'react'
import CardWrapper from './CardWrapper'
import type { Card } from '@/types'
import { XP_VALUES } from '@/types'

export default function CardChallenge({ card, onComplete }: { card: Card; onComplete: (id: string, xp: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const options = card.options ?? []
  const correctIndex = options.indexOf(card.correct_answer ?? '')
  const isCorrect = selected === correctIndex
  const xp = selected !== null ? (isCorrect ? XP_VALUES[card.difficulty] + 5 : Math.floor(XP_VALUES[card.difficulty] / 2)) : undefined

  return (
    <CardWrapper card={card} onComplete={onComplete} xpEarned={xp} showNext={selected !== null}>
      <p className="text-gray-700 font-medium">{card.content}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, i) => {
          let cls = 'p-3 rounded-lg border text-sm text-center cursor-pointer transition-colors'
          if (selected !== null) {
            if (i === correctIndex) cls += ' border-green-500 bg-green-50 text-green-800'
            else if (i === selected && !isCorrect) cls += ' border-red-400 bg-red-50 text-red-700'
            else cls += ' border-gray-200 text-gray-400'
          } else {
            cls += ' border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
          }
          return (
            <button key={i} onClick={() => selected === null && setSelected(i)} className={cls}>
              {option}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div className="bg-indigo-50 rounded-lg p-3 text-sm text-gray-700 border border-indigo-100">
          {card.explanation}
        </div>
      )}
    </CardWrapper>
  )
}
