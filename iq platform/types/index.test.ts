import { describe, it, expect } from 'vitest'
import type { Card, User, Pillar, CardType, CardStatus } from './index'

describe('types', () => {
  it('Pillar values are correct', () => {
    const pillars: Pillar[] = ['think', 'people', 'business', 'self']
    expect(pillars).toHaveLength(4)
  })

  it('CardType values are correct', () => {
    const types: CardType[] = ['concept', 'scenario', 'challenge', 'bias']
    expect(types).toHaveLength(4)
  })
})
