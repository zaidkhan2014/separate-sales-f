import { describe, expect, it } from 'vitest'
import {
  defaultSalesListUrlState,
  parseSalesListSearchParams,
  salesListStateToApiFilters,
  serializeSalesListFiltersForStorage,
  toSalesListSearchParams,
} from '@/pages/sales/salesListSearchParams'
import { birthYearForLeadsApi } from '@/pages/sales/salesConstants'

function roundTrip(initial: ReturnType<typeof defaultSalesListUrlState>) {
  const p = toSalesListSearchParams(initial)
  return parseSalesListSearchParams(p)
}

describe('salesListSearchParams', () => {
  it('round-trips defaults via empty URLSearchParams', () => {
    const parsed = parseSalesListSearchParams(new URLSearchParams())
    expect(parsed).toEqual(defaultSalesListUrlState())
  })

  it('round-trips non-default filters', () => {
    const state = {
      ...defaultSalesListUrlState(),
      status: 'INTERESTED' as const,
      query: 'john',
      page: 2,
      accountStatus: 'ANY' as const,
      profileStatus: 'PENDING' as const,
      subscribedTri: 'true' as const,
      verifiedTri: 'false' as const,
      gender: 'Male',
      birthYear: '2000',
      maritalStatus: 'Never married',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      pool: 'true' as const,
      sort: 'leadScore' as const,
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('round-trips birthYear and maritalStatus in URL', () => {
    const state = {
      ...defaultSalesListUrlState(),
      birthYear: '1995',
      maritalStatus: 'Divorced',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('preserves trailing space in maritalStatus while typing', () => {
    const state = {
      ...defaultSalesListUrlState(),
      maritalStatus: 'Never ',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('preserves out-of-range birthYear string from URL', () => {
    const parsed = parseSalesListSearchParams(new URLSearchParams('birthYear=1899'))
    expect(parsed.birthYear).toBe('1899')
  })

  it('maps pool and assignedToMe to API filters', () => {
    const parsed = {
      ...defaultSalesListUrlState(),
      pool: 'true' as const,
      assignedToMe: 'true' as const,
    }
    const api = salesListStateToApiFilters(parsed, 20)
    expect(api.pool).toBe(true)
    expect(api.assignedToMe).toBe(true)
  })

  it('omits invalid birthYear from API filters', () => {
    const parsed = { ...defaultSalesListUrlState(), birthYear: '1800' }
    expect(salesListStateToApiFilters(parsed, 20).birthYear).toBeUndefined()
    expect(birthYearForLeadsApi('1800')).toBeUndefined()
    expect(birthYearForLeadsApi('2000')).toBe(2000)
  })

  it('round-trips datetime-local fragments in URL', () => {
    const state = {
      ...defaultSalesListUrlState(),
      start: '2026-01-01T10:00',
      end: '2026-01-31T18:00',
      followUpStart: '2026-02-01T08:00',
      followUpEnd: '2026-02-10T09:00',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('clamps invalid page', () => {
    const p = new URLSearchParams('page=-3&page=notnum')
    expect(parseSalesListSearchParams(p).page).toBe(0)
    const p2 = new URLSearchParams('page=5')
    expect(parseSalesListSearchParams(p2).page).toBe(5)
  })

  it('falls back for unknown enum values', () => {
    const p = new URLSearchParams('status=UNKNOWN&accountStatus=FOO&profileStatus=BAR')
    const parsed = parseSalesListSearchParams(p)
    const d = defaultSalesListUrlState()
    expect(parsed.status).toBe(d.status)
    expect(parsed.accountStatus).toBe(d.accountStatus)
    expect(parsed.profileStatus).toBe(d.profileStatus)
  })

  it('accepts IN_PROCESS and CONVERTED status filters', () => {
    for (const status of ['IN_PROCESS', 'CONVERTED'] as const) {
      const parsed = parseSalesListSearchParams(new URLSearchParams(`status=${status}`))
      expect(parsed.status).toBe(status)
    }
  })

  it('serializeSalesListFiltersForStorage returns empty for defaults', () => {
    expect(serializeSalesListFiltersForStorage(defaultSalesListUrlState())).toBe('')
  })

  it('serializeSalesListFiltersForStorage round-trips with parse', () => {
    const state = {
      ...defaultSalesListUrlState(),
      status: 'INTERESTED' as const,
      query: 'test',
      page: 1,
    }
    const serialized = serializeSalesListFiltersForStorage(state)
    expect(parseSalesListSearchParams(new URLSearchParams(serialized))).toEqual(state)
  })
})
