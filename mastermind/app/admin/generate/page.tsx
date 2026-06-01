'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PILLAR_LABELS, PILLAR_TOPICS, type Pillar, type CardType } from '@/types'
import { Sparkles } from 'lucide-react'

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'concept', label: 'מושג' },
  { value: 'scenario', label: 'תרחיש' },
  { value: 'challenge', label: 'אתגר' },
  { value: 'bias', label: 'הטיות' },
]

export default function GeneratePage() {
  const [pillar, setPillar] = useState<Pillar>('think')
  const [type, setType] = useState<CardType>('concept')
  const [topic, setTopic] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const topics = PILLAR_TOPICS[pillar]

  async function generate() {
    setLoading(true)
    setResult('')
    const res = await fetch('/api/cards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillar, type, topic: topic || undefined }),
    })
    const data = await res.json()
    setResult(
      data.created
        ? `נוצרו ${data.created} כרטיסים (רמות 1–10).`
        : data.error
    )
    setLoading(false)
  }

  const selectCls =
    'w-full bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">ייצור תוכן</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          יוצר 10 כרטיסים — אחד לכל רמת קושי (1–10)
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">עמודה</Label>
            <select
              className={selectCls}
              value={pillar}
              onChange={e => {
                setPillar(e.target.value as Pillar)
                setTopic('')
              }}
            >
              {(Object.keys(PILLAR_LABELS) as Pillar[]).map(p => (
                <option key={p} value={p}>{PILLAR_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">נושא</Label>
            <select className={selectCls} value={topic} onChange={e => setTopic(e.target.value)}>
              <option value="">כללי</option>
              {topics.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs text-muted-foreground">סוג כרטיס</Label>
            <select
              className={selectCls}
              value={type}
              onChange={e => setType(e.target.value as CardType)}
            >
              {CARD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full gap-2">
        <Sparkles size={15} />
        {loading ? 'מייצר 10 כרטיסים...' : 'ייצר 10 כרטיסים (רמות 1–10)'}
      </Button>

      {result && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            result.includes('נוצרו')
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {result}
        </div>
      )}
    </div>
  )
}
