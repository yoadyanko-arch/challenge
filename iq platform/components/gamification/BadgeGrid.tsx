import type { UserBadge } from '@/types'

interface Props { badges: UserBadge[] }

export default function BadgeGrid({ badges }: Props) {
  if (badges.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-4">עוד אין תגים — התחל להשלים כרטיסים!</p>
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map(ub => (
        <div key={ub.badge_id} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center">
          <span className="text-3xl">{ub.badge?.icon}</span>
          <span className="text-xs font-medium text-gray-700">{ub.badge?.name}</span>
        </div>
      ))}
    </div>
  )
}
