import { describe, it, expect } from 'vitest'
import type { Card, User, Pillar, CardType, CardStatus } from './index'
import { getLevelFromXP } from './index'

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

describe('getLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => {
    expect(getLevelFromXP(0)).toBe(1)
  })

  it('returns level 2 at exact 100 XP threshold', () => {
    expect(getLevelFromXP(100)).toBe(2)
  })

  it('returns level 10 at max threshold 5000 XP', () => {
    expect(getLevelFromXP(5000)).toBe(10)
  })

  it('caps at level 10 beyond max threshold', () => {
    expect(getLevelFromXP(9999)).toBe(10)
  })

  it('returns level 1 for negative XP', () => {
    expect(getLevelFromXP(-1)).toBe(1)
  })
})
