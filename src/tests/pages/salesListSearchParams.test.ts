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
      maritalStatus: 'Never Married',
      country: 'India',
      countryIso: 'IN',
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

  it('round-trips profileCreatedFor in URL', () => {
    const state = {
      ...defaultSalesListUrlState(),
      profileCreatedFor: 'SELF',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('accepts known profileCreatedFor values and rejects unknown', () => {
    expect(parseSalesListSearchParams(new URLSearchParams('profileCreatedFor=SELF')).profileCreatedFor).toBe(
      'SELF',
    )
    expect(
      parseSalesListSearchParams(new URLSearchParams('profileCreatedFor=NON_SELF')).profileCreatedFor,
    ).toBe('NON_SELF')
    expect(parseSalesListSearchParams(new URLSearchParams('profileCreatedFor=Self')).profileCreatedFor).toBe(
      '',
    )
  })

  it('maps profileCreatedFor to API filters and omits Any', () => {
    expect(
      salesListStateToApiFilters({ ...defaultSalesListUrlState(), profileCreatedFor: 'NON_SELF' }, 20)
        .profileCreatedFor,
    ).toBe('NON_SELF')
    expect(
      salesListStateToApiFilters({ ...defaultSalesListUrlState(), profileCreatedFor: '' }, 20).profileCreatedFor,
    ).toBeUndefined()
  })

  it('accepts known marital statuses and rejects unknown', () => {
    expect(parseSalesListSearchParams(new URLSearchParams('maritalStatus=Never%20Married')).maritalStatus).toBe(
      'Never Married',
    )
    expect(parseSalesListSearchParams(new URLSearchParams('maritalStatus=Separated')).maritalStatus).toBe(
      'Separated',
    )
    expect(parseSalesListSearchParams(new URLSearchParams('maritalStatus=Never%20married')).maritalStatus).toBe('')
  })

  it('maps country name to API and keeps countryIso out of API filters', () => {
    const api = salesListStateToApiFilters(
      {
        ...defaultSalesListUrlState(),
        country: 'India',
        countryIso: 'IN',
        state: 'Uttar Pradesh',
        city: 'Lucknow',
      },
      20,
    )
    expect(api.country).toBe('India')
    expect(api.state).toBe('Uttar Pradesh')
    expect(api.city).toBe('Lucknow')
    expect(api).not.toHaveProperty('countryIso')
  })

  it('resolves country from countryIso on parse', () => {
    const parsed = parseSalesListSearchParams(new URLSearchParams('countryIso=IN&state=Uttar%20Pradesh'))
    expect(parsed.countryIso).toBe('IN')
    expect(parsed.country).toBe('India')
    expect(parsed.state).toBe('Uttar Pradesh')
  })

  it('preserves multi-word and trailing-space state/city while typing', () => {
    const midType = {
      ...defaultSalesListUrlState(),
      state: 'Uttar ',
      city: 'New ',
    }
    expect(toSalesListSearchParams(midType).get('state')).toBe('Uttar ')
    expect(toSalesListSearchParams(midType).get('city')).toBe('New ')
    expect(roundTrip(midType)).toEqual(midType)
  })

  it('trims state/city when mapping to API filters', () => {
    const api = salesListStateToApiFilters(
      {
        ...defaultSalesListUrlState(),
        state: 'Uttar Pradesh ',
        city: ' New Delhi',
      },
      20,
    )
    expect(api.state).toBe('Uttar Pradesh')
    expect(api.city).toBe('New Delhi')
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

  it('round-trips minIncomeBandId in URL', () => {
    const state = {
      ...defaultSalesListUrlState(),
      minIncomeBandId: 'INC_IN_30_40',
    }
    expect(roundTrip(state)).toEqual(state)
  })

  it('parses invalid minIncomeBandId in URL as empty', () => {
    const parsed = parseSalesListSearchParams(new URLSearchParams('minIncomeBandId=INVALID_BAND'))
    expect(parsed.minIncomeBandId).toBe('')
  })

  it('maps valid minIncomeBandId to API filters', () => {
    const parsed = { ...defaultSalesListUrlState(), minIncomeBandId: 'INC_IN_30_40' }
    expect(salesListStateToApiFilters(parsed, 20).minIncomeBandId).toBe('INC_IN_30_40')
  })

  it('omits invalid minIncomeBandId from API filters', () => {
    const parsed = { ...defaultSalesListUrlState(), minIncomeBandId: 'INVALID_BAND' }
    expect(salesListStateToApiFilters(parsed, 20).minIncomeBandId).toBeUndefined()
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
