import { describe, expect, it } from 'vitest'
import {
  defaultVipListUrlState,
  parseVipListSearchParams,
  toVipListSearchParams,
  vipListStateToApiFilters,
  vipRequestedRangePreset,
} from '@/pages/vip/vipListSearchParams'
import {
  VIP_PENDING_STATUSES,
  formatVipPendingBadge,
  sumVipPendingTotals,
} from '@/pages/vip/vipConstants'

function roundTrip(initial: ReturnType<typeof defaultVipListUrlState>) {
  return parseVipListSearchParams(toVipListSearchParams(initial))
}

describe('vipListSearchParams', () => {
  it('round-trips defaults via empty URLSearchParams', () => {
    expect(parseVipListSearchParams(new URLSearchParams())).toEqual(defaultVipListUrlState())
  })

  it('round-trips filters and omits ALL status from URL', () => {
    const state = {
      ...defaultVipListUrlState(),
      status: 'INTERESTED' as const,
      query: 'Aisha',
      pool: 'true' as const,
      sort: 'follow_up' as const,
      page: 1,
    }
    expect(roundTrip(state)).toEqual(state)
    expect(toVipListSearchParams(defaultVipListUrlState()).get('status')).toBeNull()
  })

  it('maps ALL status to undefined for API', () => {
    const api = vipListStateToApiFilters(
      {
        ...defaultVipListUrlState(),
        status: 'ALL',
        query: 'Q123',
      },
      20,
    )
    expect(api.status).toBeUndefined()
    expect(api.query).toBe('Q123')
    expect(api.size).toBe(20)
  })

  it('vipRequestedRangePreset returns datetime-local start/end', () => {
    const range = vipRequestedRangePreset(7)
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe('vip pending badge helpers', () => {
  it('sums open-status totals and excludes terminal statuses from the pending list', () => {
    expect(VIP_PENDING_STATUSES).not.toContain('CONVERTED')
    expect(VIP_PENDING_STATUSES).not.toContain('NOT_INTERESTED')
    expect(sumVipPendingTotals([3, 2, 1, 0, 4, 5])).toBe(15)
  })

  it('formats WhatsApp-style badge labels', () => {
    expect(formatVipPendingBadge(0)).toBe('')
    expect(formatVipPendingBadge(7)).toBe('7')
    expect(formatVipPendingBadge(99)).toBe('99')
    expect(formatVipPendingBadge(100)).toBe('99+')
  })
})
