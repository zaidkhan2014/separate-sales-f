import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ReviewQueuePage from '@/pages/review-queue/ReviewQueuePage'

vi.mock('@/hooks/api/useAdminUsers', () => ({
  useAdminReviewQueue: () => ({
    data: { items: [], page: 0, size: 20, total: 0 },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useForceApproveReview: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe('ReviewQueuePage', () => {
  it('renders page header and filters', () => {
    render(<ReviewQueuePage />)
    expect(screen.getByRole('heading', { name: 'Review Queue' })).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by gender')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by profile created for')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by profile status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by review code')).toBeInTheDocument()
    expect(screen.getByText('No profiles in review queue.')).toBeInTheDocument()
  })
})
