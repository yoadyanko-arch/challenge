import { describe, it, expect } from 'vitest'
import { buildPrompt } from './prompts'

describe('buildPrompt', () => {
  it('includes pillar in prompt', () => {
    const prompt = buildPrompt('think', 'bias', 'medium')
    expect(prompt).toContain('think')
  })

  it('includes card type in prompt', () => {
    const prompt = buildPrompt('people', 'scenario', 'easy')
    expect(prompt).toContain('scenario')
  })

  it('returns a non-empty string', () => {
    const prompt = buildPrompt('business', 'concept', 'hard')
    expect(prompt.length).toBeGreaterThan(50)
  })
})
