import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

describe('SearchableSelect', () => {
  it('filters options by query and selects a match', () => {
    const onChange = vi.fn()
    render(
      <SearchableSelect
        options={[
          { value: 'IN', label: 'India' },
          { value: 'AE', label: 'United Arab Emirates' },
        ]}
        value=""
        onChange={onChange}
        aria-label="Country"
      />,
    )

    const input = screen.getByLabelText('Country')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'India' } })
    expect(screen.getByRole('option', { name: 'India' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'United Arab Emirates' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'India' }))
    expect(onChange).toHaveBeenCalledWith('IN')
  })
})
