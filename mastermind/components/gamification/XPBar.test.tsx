import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import XPBar from './XPBar'

describe('XPBar', () => {
  it('shows XP value', () => {
    render(<XPBar xp={150} level={2} />)
    expect(screen.getByText(/150/)).toBeInTheDocument()
  })

  it('shows level', () => {
    render(<XPBar xp={150} level={2} />)
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })
})
