'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS, PILLAR_TOPICS } from '@/types'
import type { Card, Pillar } from '@/types'
import {
  ChevronDown, ChevronRight, Trash2, Pencil, Check, X,
  Loader2, FolderOpen, Folder,
} from 'lucide-react'

type GroupedCards = Record<Pillar, Record<string, Card[]>>

const TYPE_LABELS: Record<string, string> = {
  concept: 'מושג',
  scenario: 'תרחיש',
  challenge: 'אתגר',
  bias: 'הטיה',
}

const DIFFICULTY_COLORS = [
  '', // 0 unused
  'bg-emerald-500/20 text-emerald-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-amber-500/20 text-amber-400',
  'bg-amber-500/20 text-amber-400',
  'bg-amber-500/20 text-amber-400',
  'bg-red-500/20 text-red-400',
  'bg-red-500/20 text-red-400',
  'bg-red-500/20 text-red-400',
]

function groupCards(cards: Card[]): GroupedCards {
  const pillars: Pillar[] = ['think', 'people', 'business', 'self']
  const grouped = {} as GroupedCards
  for (const p of pillars) {
    grouped[p] = {}
    for (const t of PILLAR_TOPICS[p]) {
      grouped[p][t.value] = []
    }
  }
  for (const card of cards) {
    const topicKey = card.topic ?? '__unknown__'
    if (!grouped[card.pillar]) grouped[card.pillar] = {}
    if (!grouped[card.pillar][topicKey]) grouped[card.pillar][topicKey] = []
    grouped[card.pillar][topicKey].push(card)
  }
  return grouped
}

interface EditFormState {
  title: string
  question: string
  content: string
  options: string[]
  correct_answer: string
  explanation: string
  source: string
  difficulty_level: number
}

function EditForm({
  card,
  onSave,
  onCancel,
}: {
  card: Card
  onSave: (updated: Card) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<EditFormState>({
    title: card.title,
    question: card.question ?? '',
    content: card.content,
    options: card.options ?? ['', '', '', ''],
    correct_answer: card.correct_answer ?? '',
    explanation: card.explanation,
    source: card.source ?? '',
    difficulty_level: card.difficulty_level ?? 5,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          question: form.question || null,
          content: form.content,
          options: form.options.filter(Boolean).length >= 2 ? form.options : null,
          correct_answer: form.correct_answer || null,
          explanation: form.explanation,
          source: form.source || null,
          difficulty_level: form.difficulty_level,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onSave(data.card as Card)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה בשמירה')
      setSaving(false)
    }
  }

  const diffLabel = form.difficulty_level <= 3 ? 'קל' : form.difficulty_level <= 7 ? 'בינוני' : 'קשה'

  return (
    <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3 text-xs" dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <label className="text-muted-foreground font-medium">כותרת</label>
          <input
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div className="space-y-1 col-span-2">
          <label className="text-muted-foreground font-medium">שאלה</label>
          <input
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
            value={form.question}
            onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
            placeholder="שאלה (אופציונלי)"
          />
        </div>

        <div className="space-y-1 col-span-2">
          <label className="text-muted-foreground font-medium">תוכן</label>
          <textarea
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm min-h-[64px] resize-none"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
        </div>
      </div>

      {(card.type !== 'bias' || form.options.some(Boolean)) && (
        <div className="space-y-2">
          <label className="text-muted-foreground font-medium">תשובות אפשריות</label>
          {form.options.map((opt, i) => (
            <input
              key={i}
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
              value={opt}
              placeholder={`אפשרות ${i + 1}`}
              onChange={e => {
                const next = [...form.options]
                next[i] = e.target.value
                setForm(f => ({ ...f, options: next }))
              }}
            />
          ))}
          <div className="space-y-1">
            <label className="text-muted-foreground font-medium">תשובה נכונה</label>
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
              value={form.correct_answer}
              onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))}
            >
              <option value="">בחר תשובה נכונה</option>
              {form.options.filter(Boolean).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-muted-foreground font-medium">הסבר</label>
        <textarea
          className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm min-h-[64px] resize-none"
          value={form.explanation}
          onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">מקור</label>
          <input
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
            value={form.source}
            placeholder="מקור (אופציונלי)"
            onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">
            דרגת קושי: {form.difficulty_level} ({diffLabel})
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            className="w-full"
            value={form.difficulty_level}
            onChange={e => setForm(f => ({ ...f, difficulty_level: Number(e.target.value) }))}
          />
        </div>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 h-8">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          שמור
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={saving} className="h-8">
          <X size={12} />
        </Button>
      </div>
    </div>
  )
}

function CardRow({
  card,
  onDelete,
  onUpdate,
}: {
  card: Card
  onDelete: (id: string) => void
  onUpdate: (updated: Card) => void
}) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('למחוק את הכרטיס הזה לצמיתות?')) return
    setDeleting(true)
    const res = await fetch(`/api/cards/${card.id}/delete`, { method: 'POST' })
    if (res.ok) onDelete(card.id)
    else setDeleting(false)
  }

  const lvl = card.difficulty_level ?? 0

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 rounded-lg group">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[lvl] ?? 'bg-muted text-muted-foreground'}`}>
          {lvl}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">
          {TYPE_LABELS[card.type] ?? card.type}
        </span>
        <span className="text-sm flex-1 min-w-0 truncate">{card.title}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(e => !e)}
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-1 mb-2">
          <EditForm
            card={card}
            onSave={updated => { onUpdate(updated); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  )
}

function TopicSection({
  topicValue,
  topicLabel,
  cards,
  onDelete,
  onUpdate,
}: {
  topicValue: string
  topicLabel: string
  cards: Card[]
  onDelete: (id: string) => void
  onUpdate: (updated: Card) => void
}) {
  const [open, setOpen] = useState(false)
  if (cards.length === 0) return null

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-colors text-right"
      >
        {open
          ? <FolderOpen size={13} className="text-primary shrink-0" />
          : <Folder size={13} className="text-muted-foreground shrink-0" />}
        <span className="text-sm font-semibold flex-1">{topicLabel}</span>
        <span className="text-xs text-muted-foreground">{cards.length} כרטיסים</span>
        {open
          ? <ChevronDown size={13} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={13} className="text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="p-2 space-y-0.5">
          {[...cards]
            .sort((a, b) => (a.difficulty_level ?? 0) - (b.difficulty_level ?? 0))
            .map(card => (
              <CardRow
                key={card.id}
                card={card}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
        </div>
      )}
    </div>
  )
}

const PILLAR_ORDER: Pillar[] = ['think', 'people', 'business', 'self']

export default function AdminCardsTree({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState(initialCards)
  const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({})

  const grouped = groupCards(cards)
  const totalByPillar = (p: Pillar) => Object.values(grouped[p]).reduce((s, arr) => s + arr.length, 0)

  function togglePillar(p: Pillar) {
    setOpenPillars(prev => ({ ...prev, [p]: !prev[p] }))
  }

  function handleDelete(id: string) {
    setCards(prev => prev.filter(c => c.id !== id))
  }

  function handleUpdate(updated: Card) {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        אין כרטיסים מאושרים
      </div>
    )
  }

  return (
    <div className="space-y-3" dir="rtl">
      {PILLAR_ORDER.map(pillar => {
        const count = totalByPillar(pillar)
        const isOpen = !!openPillars[pillar]
        const topics = PILLAR_TOPICS[pillar]

        return (
          <div key={pillar} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => togglePillar(pillar)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{count}</span>
              </div>
              <span className="text-sm font-bold flex-1 text-right">{PILLAR_LABELS[pillar]}</span>
              <span className="text-xs text-muted-foreground">{topics.length} נושאים</span>
              {isOpen
                ? <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-2">
                {topics.map(t => (
                  <TopicSection
                    key={t.value}
                    topicValue={t.value}
                    topicLabel={t.label}
                    cards={grouped[pillar][t.value] ?? []}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
                <TopicSection
                  topicValue="__unknown__"
                  topicLabel="כללי"
                  cards={grouped[pillar]['__unknown__'] ?? []}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
