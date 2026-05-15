'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS } from '@/types'
import type { Card } from '@/types'

interface GameCardProps {
  card: Card
  timeLeft: number
  timedOut: boolean
  onAnswered: (wasCorrect: boolean | null, userAnswer: string | null, xpEarned: number) => void
  onNext: () => void
}

export default function GameCard({ card, timeLeft, timedOut, onAnswered, onNext }: GameCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const answeredRef = useRef(false)

  const isMCQ = card.type !== 'bias'
  const options = card.options ?? []
  const correctIndex = options.indexOf(card.correct_answer ?? '')

  const timeProgress = Math.min(1, Math.max(0, timeLeft / 60))
  const timerColor =
    timeLeft > 20 ? 'bg-primary' : timeLeft > 10 ? 'bg-amber-400' : 'bg-destructive'

  const showAnswerFromTimeout = timedOut && selectedIndex === null && !revealed
  const showContent = selectedIndex !== null || revealed || showAnswerFromTimeout

  useEffect(() => {
    if (!timedOut || answeredRef.current) return
    answeredRef.current = true
    setXpEarned(0)
    onAnswered(isMCQ ? false : null, null, 0)
  }, [timedOut])

  function computeXp(correct: boolean, isBias: boolean): number {
    const level = card.difficulty_level ?? 5
    const timeBonus = Math.floor((timeLeft / 60) * 20)
    if (isBias) return Math.floor(level * 5 + timeBonus * 0.5)
    return correct ? level * 10 + timeBonus : 0
  }

  function handleSelect(i: number) {
    if (answeredRef.current || selectedIndex !== null) return
    answeredRef.current = true
    const correct = i === correctIndex
    const xp = computeXp(correct, false)
    setSelectedIndex(i)
    setXpEarned(xp)
    onAnswered(correct, options[i], xp)
  }

  function handleReveal() {
    if (answeredRef.current || revealed) return
    answeredRef.current = true
    const xp = computeXp(false, true)
    setRevealed(true)
    setXpEarned(xp)
    onAnswered(null, null, xp)
  }

  function getOptionClass(i: number): string {
    const base = 'w-full text-right p-3 rounded-xl border text-sm transition-all font-medium'
    if (showContent || selectedIndex !== null) {
      if (i === correctIndex) return `${base} border-emerald-500 bg-emerald-950/30 text-emerald-400`
      if (i === selectedIndex && i !== correctIndex) return `${base} border-destructive/60 bg-destructive/10 text-destructive`
      return `${base} border-border text-muted-foreground opacity-40`
    }
    return `${base} border-border hover:border-primary hover:bg-accent cursor-pointer`
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerColor}`}
          style={{ width: `${timeProgress * 100}%` }}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 space-y-1 border-b border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              {PILLAR_LABELS[card.pillar]}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              רמה {card.difficulty_level ?? '?'}
            </span>
          </div>
          <h2 className="text-base font-bold leading-snug pt-1">{card.title}</h2>
        </div>

        <div className="px-5 py-4 space-y-4">
          {card.type === 'bias' && (
            <div className="bg-accent border border-primary/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">הטיה קוגניטיבית</p>
              <p className="text-foreground/80 text-sm leading-relaxed">{card.content}</p>
            </div>
          )}

          {card.type !== 'bias' && card.content && card.content.trim() && (
            <p className="text-foreground/80 leading-relaxed text-sm">{card.content}</p>
          )}

          {card.question && (
            <p className="font-semibold text-sm text-foreground">{card.question}</p>
          )}

          {isMCQ && (
            <div className={card.type === 'challenge' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
              {options.map((option, i) => (
                <button key={i} className={getOptionClass(i)} onClick={() => handleSelect(i)}>
                  {option}
                </button>
              ))}
            </div>
          )}

          {card.type === 'bias' && !revealed && !showAnswerFromTimeout && (
            <Button variant="outline" className="w-full" onClick={handleReveal}>
              איך להימנע?
            </Button>
          )}

          {showAnswerFromTimeout && !revealed && (
            <p className="text-center text-xs font-semibold text-destructive">נגמר הזמן!</p>
          )}

          {showContent && (
            <>
              <div className="bg-accent rounded-xl p-4 text-sm text-foreground border border-primary/20 leading-relaxed">
                {card.explanation}
              </div>
              {card.source && (
                <p className="text-xs text-muted-foreground border-r-2 border-border pr-3">
                  מקור: {card.source}
                </p>
              )}
              {xpEarned > 0 && (
                <p className="text-center font-bold text-primary text-lg">+{xpEarned} נקודות</p>
              )}
              <Button className="w-full" onClick={onNext}>
                הבא
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
