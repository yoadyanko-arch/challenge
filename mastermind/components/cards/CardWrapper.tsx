import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS } from '@/types'
import type { Card as CardType } from '@/types'

interface Props {
  card: CardType
  children: React.ReactNode
  onComplete: (cardId: string, xpEarned: number) => void
  xpEarned?: number
  showNext?: boolean
}

export default function CardWrapper({ card, children, onComplete, xpEarned, showNext }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 space-y-1 border-b border-border/60">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-medium">
              {PILLAR_LABELS[card.pillar]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {card.difficulty === 'easy' ? 'קל' : card.difficulty === 'medium' ? 'בינוני' : 'קשה'}
            </Badge>
          </div>
          <h2 className="text-base font-bold leading-snug pt-1">{card.title}</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          {children}
          {xpEarned !== undefined && (
            <div className="text-center font-bold text-primary text-lg">
              +{xpEarned} XP
            </div>
          )}
          {showNext && (
            <Button className="w-full" onClick={() => onComplete(card.id, xpEarned ?? 0)}>
              הבא
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
