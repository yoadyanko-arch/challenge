import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{PILLAR_LABELS[card.pillar]}</Badge>
            <Badge variant="outline">{card.difficulty === 'easy' ? 'קל' : card.difficulty === 'medium' ? 'בינוני' : 'קשה'}</Badge>
          </div>
          <CardTitle className="text-lg mt-2">{card.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          {xpEarned !== undefined && (
            <div className="text-center text-green-600 font-bold text-lg animate-bounce">
              +{xpEarned} XP
            </div>
          )}
          {showNext && (
            <Button className="w-full" onClick={() => onComplete(card.id, xpEarned ?? 0)}>
              הבא ←
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
