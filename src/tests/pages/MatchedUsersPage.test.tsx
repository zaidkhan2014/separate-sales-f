import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MatchedUsersPage from '@/pages/matched-users/MatchedUsersPage'

vi.mock('@/hooks/api/useAdminMatchedSales', () => ({
  useAdminMatchedSalesLeads: () => ({
    data: { items: [], page: 0, size: 20, total: 0 },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

describe('MatchedUsersPage', () => {
  it('renders page header, date filters, and empty state', () => {
    render(
      <MemoryRouter>
        <MatchedUsersPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Matched Users' })).toBeInTheDocument()
    expect(screen.getByLabelText('Matched from')).toBeInTheDocument()
    expect(screen.getByLabelText('Matched to')).toBeInTheDocument()
    expect(screen.getByText('No matched users found.')).toBeInTheDocument()
  })
})
