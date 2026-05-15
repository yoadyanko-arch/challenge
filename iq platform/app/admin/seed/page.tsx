'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS, type Pillar } from '@/types'
import { Loader2, CheckCircle2, XCircle, Zap, Sparkles } from 'lucide-react'

const PILLARS: { value: Pillar; topics: number }[] = [
  { value: 'think', topics: 5 },
  { value: 'people', topics: 5 },
  { value: 'business', topics: 8 },
  { value: 'self', topics: 4 },
]

type PillarStatus = 'idle' | 'loading' | 'done' | 'error'

interface PillarResult { created: number; failed: number }

export default function SeedPage() {
  const [status, setStatus] = useState<Record<Pillar, PillarStatus>>({
    think: 'idle', people: 'idle', business: 'idle', self: 'idle',
  })
  const [results, setResults] = useState<Record<Pillar, PillarResult | null>>({
    think: null, people: null, business: null, self: null,
  })
  const [runningAll, setRunningAll] = useState(false)

  async function seedPillar(pillar: Pillar): Promise<boolean> {
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
      return true
    } catch (e) {
      setStatus(prev => ({ ...prev, [pillar]: 'error' }))
      return false
    }
  }

  async function seedAll() {
    setRunningAll(true)
    for (const { value } of PILLARS) {
      if (status[value] === 'done') continue
      await seedPillar(value)
    }
    setRunningAll(false)
  }

  const totalCreated = Object.values(results).reduce((s, r) => s + (r?.created ?? 0), 0)
  const anyDone = Object.values(status).some(s => s === 'done')
  const allDone = PILLARS.every(p => status[p.value] === 'done')
  const anyLoading = Object.values(status).some(s => s === 'loading') || runningAll

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">ייצור מסיבי</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          10 כרטיסים לכל תת-נושא (רמות קושי 1–10) — סה&quot;כ 220 כרטיסים
        </p>
      </div>

      {/* One-click generate all */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">ייצר הכל בלחיצה אחת</p>
            <p className="text-xs text-muted-foreground mt-0.5">מריץ את כל 4 התחומים ברצף. לוקח ~4–6 דקות.</p>
          </div>
          <Button
            onClick={seedAll}
            disabled={anyLoading || allDone}
            className="shrink-0 gap-1.5"
          >
            {anyLoading && runningAll
              ? <><Loader2 size={14} className="animate-spin" />מייצר...</>
              : allDone
              ? <><CheckCircle2 size={14} />הושלם</>
              : <><Sparkles size={14} />ייצר הכל</>
            }
          </Button>
        </div>
        {anyDone && (
          <p className="text-xs text-emerald-400 font-medium">
            {totalCreated} כרטיסים נוצרו עד כה
          </p>
        )}
      </div>

      {/* Per-pillar status */}
      <div className="space-y-2">
        {PILLARS.map(({ value, topics }) => {
          const s = status[value]
          const r = results[value]
          return (
            <div key={value} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {s === 'done' && <CheckCircle2 size={15} className="text-emerald-400" />}
                {s === 'error' && <XCircle size={15} className="text-destructive" />}
                {s === 'loading' && <Loader2 size={15} className="animate-spin text-primary" />}
                {s === 'idle' && <span className="text-xs text-muted-foreground font-mono">{topics * 10}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{PILLAR_LABELS[value]}</p>
                <p className="text-xs text-muted-foreground">
                  {s === 'idle' && `${topics} נושאים × 10 רמות`}
                  {s === 'loading' && <span className="animate-pulse">מייצר כרטיסים...</span>}
                  {s === 'done' && r && <span className="text-emerald-400">{r.created} כרטיסים נוצרו{r.failed > 0 ? `, ${r.failed} נכשלו` : ''}</span>}
                  {s === 'error' && <span className="text-destructive">שגיאה — לחץ ייצר שוב</span>}
                </p>
              </div>
              <Button
                size="sm"
                variant={s === 'done' ? 'outline' : 'default'}
                onClick={() => seedPillar(value)}
                disabled={anyLoading || s === 'done'}
                className="shrink-0 gap-1.5 h-8"
              >
                {s === 'loading'
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Zap size={12} />
                }
                {s === 'loading' ? '' : s === 'done' ? 'הושלם' : s === 'error' ? 'שוב' : 'ייצר'}
              </Button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        אל תסגור את הדף בזמן הייצור. ניתן לייצר שוב בכל עת — כרטיסים חדשים יתווספו לקיימים.
      </p>
    </div>
  )
}
