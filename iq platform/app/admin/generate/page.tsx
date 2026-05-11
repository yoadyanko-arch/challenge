'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PILLAR_LABELS, PILLAR_TOPICS, type Pillar, type CardType, type Difficulty } from '@/types'

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'concept', label: 'מושג' },
  { value: 'scenario', label: 'תרחיש' },
  { value: 'challenge', label: 'אתגר' },
  { value: 'bias', label: 'ביאס' },
]

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'קל' },
  { value: 'medium', label: 'בינוני' },
  { value: 'hard', label: 'קשה' },
]

export default function GeneratePage() {
  const [pillar, setPillar] = useState<Pillar>('think')
  const [type, setType] = useState<CardType>('concept')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [topic, setTopic] = useState<string>('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const topics = PILLAR_TOPICS[pillar]

  async function generate() {
    setLoading(true)
    setResult('')
    const res = await fetch('/api/cards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillar, type, difficulty, topic: topic || undefined, count }),
    })
    const data = await res.json()
    setResult(data.created ? `נוצרו ${data.created} כרטיסים! עבור לתור לאישור.` : data.error)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ייצור תוכן עם AI</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>עמודה</Label>
          <select className="w-full border rounded p-2 mt-1" value={pillar} onChange={e => { setPillar(e.target.value as Pillar); setTopic('') }}>
            {(Object.keys(PILLAR_LABELS) as Pillar[]).map(p => (
              <option key={p} value={p}>{PILLAR_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>נושא (אופציונלי)</Label>
          <select className="w-full border rounded p-2 mt-1" value={topic} onChange={e => setTopic(e.target.value)}>
            <option value="">כללי</option>
            {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label>סוג כרטיס</Label>
          <select className="w-full border rounded p-2 mt-1" value={type} onChange={e => setType(e.target.value as CardType)}>
            {CARD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <Label>קושי</Label>
          <select className="w-full border rounded p-2 mt-1" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
            {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <Label>כמות (מקסימום 20)</Label>
          <input type="number" min={1} max={20} className="w-full border rounded p-2 mt-1" value={count} onChange={e => setCount(Number(e.target.value))} />
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-full">
        {loading ? 'מייצר...' : `ייצר ${count} כרטיסים`}
      </Button>

      {result && <p className={`text-sm ${result.includes('נוצרו') ? 'text-green-600' : 'text-red-500'}`}>{result}</p>}
    </div>
  )
}
