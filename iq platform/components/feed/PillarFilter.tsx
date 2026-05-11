import { PILLAR_LABELS, type Pillar } from '@/types'
import { Button } from '@/components/ui/button'

const PILLARS: (Pillar | 'all')[] = ['all', 'think', 'people', 'business', 'self']
const LABELS: Record<string, string> = { all: 'הכל', ...PILLAR_LABELS }

interface Props {
  active: Pillar | 'all'
  onChange: (p: Pillar | 'all') => void
}

export default function PillarFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 no-scrollbar">
      {PILLARS.map(p => (
        <Button
          key={p}
          size="sm"
          variant={active === p ? 'default' : 'outline'}
          onClick={() => onChange(p)}
          className="shrink-0"
        >
          {LABELS[p]}
        </Button>
      ))}
    </div>
  )
}
