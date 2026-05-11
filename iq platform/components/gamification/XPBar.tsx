import { Progress } from '@/components/ui/progress'
import { LEVEL_XP_THRESHOLDS } from '@/types'

interface Props { xp: number; level: number }

export default function XPBar({ xp, level }: Props) {
  const currentThreshold = LEVEL_XP_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_XP_THRESHOLDS[level] ?? xp
  const pct = Math.min(100, ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-500">
        <span>רמה {level}</span>
        <span>{xp} XP</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  )
}
