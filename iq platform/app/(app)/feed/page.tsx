'use client'
import { useState } from 'react'
import { Shuffle, Lightbulb, Users, TrendingUp, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GameSession from '@/components/game/GameSession'
import SessionSummary from '@/components/game/SessionSummary'
import { PILLAR_TOPICS, PILLAR_LABELS, type Pillar, type StoredCardResult } from '@/types'

type PillarOption = Pillar | 'mix'
type ViewState = 'selection' | 'playing' | 'summary'

const PILLARS: { value: PillarOption; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'think', label: PILLAR_LABELS.think, icon: Lightbulb, description: 'לוגיקה, ביאסים, קבלת החלטות' },
  { value: 'people', label: PILLAR_LABELS.people, icon: Users, description: 'פסיכולוגיה, שכנוע, מנהיגות' },
  { value: 'business', label: PILLAR_LABELS.business, icon: TrendingUp, description: 'השקעות, יזמות, אסטרטגיה' },
  { value: 'self', label: PILLAR_LABELS.self, icon: Flame, description: 'הרגלים, פרודוקטיביות, פילוסופיה' },
]

export default function FeedPage() {
  const [view, setView] = useState<ViewState>('selection')
  const [selectedPillar, setSelectedPillar] = useState<PillarOption | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [sessionResults, setSessionResults] = useState<StoredCardResult[]>([])
  const [sessionScore, setSessionScore] = useState(0)

  const topics = selectedPillar && selectedPillar !== 'mix' ? PILLAR_TOPICS[selectedPillar as Pillar] : []
  const canStart = selectedPillar !== null

  function handleSelectPillar(p: PillarOption) {
    setSelectedPillar(p)
    setSelectedTopic(null)
  }

  function handleGameComplete(results: StoredCardResult[], score: number) {
    setSessionResults(results)
    setSessionScore(score)
    setView('summary')
  }

  function handleDone() {
    setView('selection')
    setSelectedPillar(null)
    setSelectedTopic(null)
    setSessionResults([])
    setSessionScore(0)
  }

  if (view === 'playing' && selectedPillar) {
    return (
      <GameSession
        pillar={selectedPillar}
        topic={selectedTopic}
        onComplete={handleGameComplete}
        onExit={() => setView('selection')}
      />
    )
  }

  if (view === 'summary') {
    return (
      <SessionSummary
        results={sessionResults}
        score={sessionScore}
        pillar={selectedPillar!}
        topic={selectedTopic}
        onDone={handleDone}
      />
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8 pb-24">
      <div className="text-center space-y-1.5 pt-2">
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          במה אתה רוצה<br />להשתפר היום?
        </h1>
        <p className="text-sm text-muted-foreground">בחר תחום ויצא לסשן</p>
      </div>

      {/* Mix — full width */}
      <div className="space-y-2">
        <button
          onClick={() => handleSelectPillar('mix')}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-right ${
            selectedPillar === 'mix'
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/40 hover:bg-accent'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            selectedPillar === 'mix' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Shuffle size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">מיקס</p>
            <p className="text-xs text-muted-foreground">קצת מכל התחומים</p>
          </div>
        </button>

        {/* Pillar grid 2×2 */}
        <div className="grid grid-cols-2 gap-2">
          {PILLARS.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              onClick={() => handleSelectPillar(value)}
              className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all text-right ${
                selectedPillar === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                selectedPillar === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic pills */}
      {selectedPillar && selectedPillar !== 'mix' && topics.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">בחר נושא:</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTopic(null)}
              className={`text-sm px-3.5 py-1.5 rounded-full border transition-all font-medium ${
                selectedTopic === null
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              מיקס
            </button>
            {topics.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedTopic(t.value)}
                className={`text-sm px-3.5 py-1.5 rounded-full border transition-all font-medium ${
                  selectedTopic === t.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {canStart && (
        <Button className="w-full py-6 text-base" onClick={() => setView('playing')}>
          התחל סשן
        </Button>
      )}
    </div>
  )
}
