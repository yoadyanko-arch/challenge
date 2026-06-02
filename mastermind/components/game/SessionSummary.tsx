'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS, type Pillar, type StoredCardResult } from '@/types'
import { CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react'

interface SessionSummaryProps {
  results: StoredCardResult[]
  score: number
  pillar: Pillar | 'mix'
  topic: string | null
  onDone: () => void
}

export default function SessionSummary({ results, score, pillar, topic, onDone }: SessionSummaryProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const correctCount = results.filter(r => r.was_correct === true).length
  const wrongCount = results.filter(r => r.was_correct === false).length
  const biasCount = results.filter(r => r.was_correct === null).length

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillar: pillar === 'mix' ? 'mix' : pillar,
          topic,
          score,
          cards_data: results,
        }),
      })
      if (!res.ok) throw new Error('save failed')
      const data = await res.json()
      if (data.id) setSessionId(data.id)
      setSaved(true)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
      <div className="text-center space-y-1 pt-2">
        <h1 className="text-2xl font-bold tracking-tight">אז מה למדנו?</h1>
        <p className="text-sm text-muted-foreground">
          {pillar === 'mix' ? 'מיקס' : PILLAR_LABELS[pillar as Pillar]}
          {topic && ` › ${topic}`}
        </p>
      </div>

      <div className="bg-card border border-primary/30 rounded-2xl p-6 text-center">
        <p className="text-4xl font-bold text-primary">{score}</p>
        <p className="text-sm text-muted-foreground mt-1">נקודות</p>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-400">{correctCount}</p>
            <p className="text-xs text-muted-foreground">נכון</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-destructive">{wrongCount}</p>
            <p className="text-xs text-muted-foreground">שגוי</p>
          </div>
          {biasCount > 0 && (
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{biasCount}</p>
              <p className="text-xs text-muted-foreground">הטיות</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {result.was_correct === true ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : result.was_correct === false ? (
                  <XCircle size={16} className="text-destructive" />
                ) : (
                  <BookOpen size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{result.card_title}</p>
                {result.card_question && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {result.card_question}
                  </p>
                )}
                {result.was_correct === false && result.correct_answer && (
                  <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                    תשובה נכונה: {result.correct_answer}
                  </p>
                )}
                {result.xp_earned > 0 && (
                  <p className="text-xs text-primary mt-1">+{result.xp_earned} נקודות</p>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5 mt-0.5">
                <Clock size={9} />
                {result.time_spent}s
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        {saveError && (
          <p className="text-center text-sm text-destructive font-medium py-1">
            שגיאה בשמירה, נסה שוב
          </p>
        )}
        {!saved ? (
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? 'שומר...' : 'שמור בפרופיל'}
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-emerald-400 font-medium py-1">
              הסשן נשמר בפרופיל שלך
            </p>
            {sessionId && (
              <Button
                className="w-full"
                onClick={() => router.push(`/diary/${sessionId}`)}
              >
                פתח יומן למידה →
              </Button>
            )}
          </>
        )}
        <Button variant="outline" className="w-full" onClick={onDone}>
          שחק שוב
        </Button>
      </div>
    </div>
  )
}
