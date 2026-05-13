import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'
import { PILLAR_LABELS, type Pillar } from '@/types'

interface SourceEntry {
  source: string
  count: number
  pillars: string[]
}

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: cards } = await supabase
    .from('cards')
    .select('source, pillar')
    .eq('status', 'approved')
    .not('source', 'is', null)

  // Group by source
  const map = new Map<string, SourceEntry>()
  for (const card of cards ?? []) {
    if (!card.source) continue
    const existing = map.get(card.source)
    if (existing) {
      existing.count++
      if (!existing.pillars.includes(card.pillar)) existing.pillars.push(card.pillar)
    } else {
      map.set(card.source, { source: card.source, count: 1, pillars: [card.pillar] })
    }
  }

  const sources = Array.from(map.values()).sort((a, b) => b.count - a.count)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">ספרייה</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sources.length} מקורות שעליהם מבוססים הכרטיסים
        </p>
      </div>

      {sources.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          אין מקורות עדיין — צור כרטיסים כדי למלא את הספרייה
        </div>
      )}

      <div className="space-y-3">
        {sources.map(entry => (
          <div key={entry.source} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">{entry.source}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {entry.pillars.map(p => (
                    <span key={p} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {PILLAR_LABELS[p as Pillar] ?? p}
                    </span>
                  ))}
                  <span className="text-[10px] text-muted-foreground">
                    {entry.count} כרטיסים
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
