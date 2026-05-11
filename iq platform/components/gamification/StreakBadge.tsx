interface Props { streak: number }

export default function StreakBadge({ streak }: Props) {
  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="font-bold text-orange-600 text-lg">{streak}</div>
        <div className="text-xs text-orange-400">ימים רצופים</div>
      </div>
    </div>
  )
}
