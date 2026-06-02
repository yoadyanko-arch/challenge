import { Flame } from 'lucide-react'

interface Props { streak: number }

export default function StreakBadge({ streak }: Props) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
        <Flame size={18} className="text-primary" />
      </div>
      <div>
        <div className="font-bold text-foreground text-lg leading-none">{streak}</div>
        <div className="text-xs text-muted-foreground mt-0.5">ימים רצופים</div>
      </div>
    </div>
  )
}
