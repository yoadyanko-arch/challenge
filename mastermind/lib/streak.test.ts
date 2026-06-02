import { describe, it, expect } from 'vitest'
import { shouldUpdateStreak, isStreakBroken } from './streak'

describe('streak logic', () => {
  it('increments streak when last active was yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    expect(shouldUpdateStreak(yesterday)).toBe(true)
  })

  it('does not increment streak when already active today', () => {
    const today = new Date().toISOString()
    expect(shouldUpdateStreak(today)).toBe(false)
  })

  it('detects broken streak when last active was 2+ days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
    expect(isStreakBroken(twoDaysAgo)).toBe(true)
  })

  it('does not break streak when last active was yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    expect(isStreakBroken(yesterday)).toBe(false)
  })
})
