'use client'
import { useState, useRef, useEffect } from 'react'
import GameCard from './GameCard'
import { PILLAR_LABELS, PILLAR_TOPICS, type Pillar, type StoredCardResult, type Card } from '@/types'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GameSessionProps {
  pillar: Pillar | 'mix'
  topic: string | null
  onComplete: (results: StoredCardResult[], score: number) => void
  onExit: () => void
}

export default function GameSession({ pillar, topic, onComplete, onExit }: GameSessionProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [timedOut, setTimedOut] = useState(false)
  const [cardAnswered, setCardAnswered] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultsRef = useRef<StoredCardResult[]>([])
  const scoreRef = useRef(0)
  const timeLeftRef = useRef(60)

  useEffect(() => {
    const params = new URLSearchParams()
    if (pillar && pillar !== 'mix') params.set('pillar', pillar)
    if (topic) params.set('topic', topic)

    fetch(`/api/cards/game?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        if (!data.cards || data.cards.length === 0) {
          setError('אין כרטיסים זמינים לנושא זה עדיין — צור כרטיסים בפאנל הניהול')
          setLoading(false)
          return
        }
        setCards(data.cards)
        setLoading(false)
        startTimer()
      })
      .catch(() => {
        setError('שגיאה בטעינת כרטיסים')
        setLoading(false)
      })

    return () => stopTimer()
  }, [])

  function startTimer() {
    stopTimer()
    timeLeftRef.current = 60
    setTimeLeft(60)
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1
      setTimeLeft(timeLeftRef.current)
      if (timeLeftRef.current <= 0) {
        stopTimer()
        setTimedOut(true)
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function handleCardAnswered(wasCorrect: boolean | null, userAnswer: string | null, xpEarned: number) {
    stopTimer()
    setCardAnswered(true)

    const card = cards[currentIndex]
    const timeSpent = 60 - timeLeftRef.current

    const result: StoredCardResult = {
      card_id: card.id,
      card_title: card.title,
      card_question: card.question ?? card.content,
      was_correct: wasCorrect,
      user_answer: userAnswer,
      correct_answer: card.correct_answer,
      explanation: card.explanation,
      xp_earned: xpEarned,
      time_spent: timeSpent,
      difficulty_level: card.difficulty_level,
      pillar: card.pillar,
    }

    resultsRef.current = [...resultsRef.current, result]
    scoreRef.current = scoreRef.current + xpEarned
    setTotalScore(scoreRef.current)
  }

  function handleNext() {
    const nextIndex = currentIndex + 1
    if (nextIndex >= cards.length) {
      onComplete(resultsRef.current, scoreRef.current)
      return
    }
    setCurrentIndex(nextIndex)
    setTimedOut(false)
    setCardAnswered(false)
    startTimer()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">טוען כרטיסים...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button variant="outline" onClick={onExit}>חזור לבחירה</Button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const level = currentCard.difficulty_level ?? 5
  const phase = level <= 3 ? 'קל' : level <= 7 ? 'בינוני' : 'קשה'
  const phaseColor = phase === 'קל' ? 'text-emerald-400' : phase === 'בינוני' ? 'text-amber-400' : 'text-destructive'

  const pillarLabel = pillar === 'mix' ? 'מיקס' : PILLAR_LABELS[pillar as Pillar]
  const topicLabel = topic
    ? (PILLAR_TOPICS[pillar as Pillar]?.find(t => t.value === topic)?.label ?? topic)
    : 'מיקס'

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onExit}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← יציאה
          </button>
          <p className="text-xs text-muted-foreground">{pillarLabel} › {topicLabel}</p>
          <div className="text-left">
            <p className="text-sm font-bold text-primary leading-none">{totalScore}</p>
            <p className="text-[10px] text-muted-foreground">נקודות</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${phaseColor}`}>{phase}</span>
          <span className="text-muted-foreground">{currentIndex + 1} / {cards.length}</span>
          <span className={timeLeft <= 10 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="py-4">
        <GameCard
          key={currentIndex}
          card={currentCard}
          timeLeft={timeLeft}
          timedOut={timedOut}
          onAnswered={handleCardAnswered}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}
