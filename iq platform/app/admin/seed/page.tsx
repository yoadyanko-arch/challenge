'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS, type Pillar } from '@/types'
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react'

const PILLARS: { value: Pillar; topics: number }[] = [
  { value: 'think', topics: 5 },
  { value: 'people', topics: 5 },
  { value: 'business', topics: 8 },
  { value: 'self', topics: 4 },
]

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function SeedPage() {
  const [status, setStatus] = useState<Record<Pillar, Status>>({
    think: 'idle', people: 'idle', business: 'idle', self: 'idle',
  })
  const [results, setResults] = useState<Record<Pillar, { created: number; failed: number } | null>>({
    think: null, people: null, business: null, self: null,
  })

  async function seedPillar(pillar: Pillar) {
    setStatus(prev => ({ ...prev, [pillar]: 'loading' }))
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(prev => ({ ...prev, [pillar]: { created: data.created, failed: data.failed } }))
      setStatus(prev => ({ ...prev, [pillar]: 'done' }))
    } catch {
      setStatus(prev => ({ ...prev, [pillar]: 'error' }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">ייצור תוכן מסיבי</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          מייצר 10 כרטיסים (רמות 1–10) לכל תת-נושא. לחץ על כל תחום בנפרד וחכה לסיום לפני הבא.
        </p>
      </div>

      <div className="space-y-3">
        {PILLARS.map(({ value, topics }) => {
          const s = status[value]
          const r = results[value]
          const total = topics * 10

          return (
            <div key={value} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {s === 'done' && <CheckCircle2 size={15} className="text-emerald-400" />}
                  {s === 'error' && <XCircle size={15} className="text-destructive" />}
                  {s === 'loading' && <Loader2 size={15} className="animate-spin text-primary" />}
                  <p className="font-semibold">{PILLAR_LABELS[value]}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {topics} נושאים × 10 רמות = {total} כרטיסים
                </p>
                {r && (
                  <p className="text-xs mt-1 font-medium text-emerald-400">
                    {r.created} נוצרו{r.failed > 0 ? `, ${r.failed} נכשלו` : ' בהצלחה'}
                  </p>
                )}
                {s === 'error' && (
                  <p className="text-xs text-destructive mt-1">שגיאה — נסה שוב</p>
                )}
                {s === 'loading' && (
                  <p className="text-xs text-muted-foreground mt-1 animate-pulse">מייצר... זה יכול לקחת כ-{Math.ceil(topics * 10 / 5 * 4)} שניות</p>
                )}
              </div>

              <Button
                onClick={() => seedPillar(value)}
                disabled={s === 'loading' || s === 'done'}
                variant={s === 'done' ? 'outline' : 'default'}
                className="shrink-0 gap-1.5"
                size="sm"
              >
                {s === 'loading' ? (
                  <><Loader2 size={13} className="animate-spin" />מייצר...</>
                ) : s === 'done' ? (
                  'הושלם'
                ) : (
                  <><Zap size={13} />{s === 'error' ? 'נסה שוב' : 'ייצר'}</>
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
        <p>אל תסגור את הדף בזמן הייצור.</p>
        <p>כרטיסים שנוצרו מופיעים מיד בפיד.</p>
        <p>ניתן לייצר שוב — יוסיף כרטיסים חדשים מבלי למחוק הישנים.</p>
      </div>
    </div>
  )
}
