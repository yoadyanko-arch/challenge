import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CardWrapper from './CardWrapper'

const mockCard = {
  id: '1', pillar: 'think' as const, type: 'concept' as const,
  title: 'Test Card', content: 'Test content', explanation: 'Test explanation',
  options: null, correct_answer: null, xp_reward: 10, topic: null,
  difficulty: 'easy' as const, status: 'approved' as const, created_at: ''
}

describe('CardWrapper', () => {
  it('renders card title', () => {
    render(<CardWrapper card={mockCard} onComplete={vi.fn()}><div>content</div></CardWrapper>)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('calls onComplete when next button clicked', () => {
    const onComplete = vi.fn()
    render(<CardWrapper card={mockCard} onComplete={onComplete} showNext xpEarned={10}><div /></CardWrapper>)
    fireEvent.click(screen.getByRole('button', { name: /הבא/i }))
    expect(onComplete).toHaveBeenCalledWith(mockCard.id, 10)
  })
})
