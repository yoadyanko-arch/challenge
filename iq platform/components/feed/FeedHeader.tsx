'use client'
import { useRouter } from 'next/navigation'
import PillarFilter from './PillarFilter'
import { PILLAR_TOPICS } from '@/types'
import type { Pillar } from '@/types'
import { Button } from '@/components/ui/button'

interface Props {
  activePillar: Pillar | 'all'
  activeTopic?: string
}

export default function FeedHeader({ activePillar, activeTopic }: Props) {
  const router = useRouter()

  function handlePillarChange(p: Pillar | 'all') {
    router.push(p === 'all' ? '/feed' : `/feed?pillar=${p}`)
  }

  function handleTopicChange(topic: string) {
    const newTopic = topic === activeTopic ? undefined : topic
    const base = activePillar === 'all' ? '/feed' : `/feed?pillar=${activePillar}`
    router.push(newTopic ? `${base}&topic=${newTopic}` : base)
  }

  const topics = activePillar !== 'all' ? PILLAR_TOPICS[activePillar] : []

  return (
    <div className="sticky top-0 bg-gray-50 pt-4 pb-2 z-10">
      <h1 className="text-xl font-bold px-4 mb-3">🧠 Mastermind</h1>
      <PillarFilter active={activePillar} onChange={handlePillarChange} />
      {topics.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-4 mt-2 no-scrollbar">
          {topics.map(t => (
            <Button
              key={t.value}
              size="sm"
              variant={activeTopic === t.value ? 'default' : 'ghost'}
              className="shrink-0 text-xs h-7"
              onClick={() => handleTopicChange(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
