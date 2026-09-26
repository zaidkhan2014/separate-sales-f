import { describe, expect, it } from 'vitest'
import {
  defaultDeletedAccountsListUrlState,
  deletedAccountsListStateToApiFilters,
  deletionRangePreset,
  parseDeletedAccountsListSearchParams,
  toDeletedAccountsListSearchParams,
} from '@/pages/deleted-accounts/deletedAccountsListSearchParams'

function roundTrip(initial: ReturnType<typeof defaultDeletedAccountsListUrlState>) {
  return parseDeletedAccountsListSearchParams(toDeletedAccountsListSearchParams(initial))
}

describe('deletedAccountsListSearchParams', () => {
  it('round-trips defaults via empty URLSearchParams', () => {
    expect(parseDeletedAccountsListSearchParams(new URLSearchParams())).toEqual(
      defaultDeletedAccountsListUrlState(),
    )
  })

  it('round-trips filters without accountStatus', () => {
    const state = {
      ...defaultDeletedAccountsListUrlState(),
      status: 'INTERESTED' as const,
      gender: 'Female',
      birthYear: '2000',
      minIncomeBandId: 'INC_IN_30_40',
      pool: 'true' as const,
      page: 1,
    }
    expect(roundTrip(state)).toEqual(state)
    expect(toDeletedAccountsListSearchParams(state).get('accountStatus')).toBeNull()
  })

  it('parses invalid minIncomeBandId in URL as empty', () => {
    const parsed = parseDeletedAccountsListSearchParams(
      new URLSearchParams('minIncomeBandId=INVALID_BAND'),
    )
    expect(parsed.minIncomeBandId).toBe('')
  })

  it('maps valid minIncomeBandId to API filters', () => {
    const parsed = { ...defaultDeletedAccountsListUrlState(), minIncomeBandId: 'INC_IN_30_40' }
    expect(deletedAccountsListStateToApiFilters(parsed, 20).minIncomeBandId).toBe('INC_IN_30_40')
  })

  it('omits invalid minIncomeBandId from API filters', () => {
    const parsed = { ...defaultDeletedAccountsListUrlState(), minIncomeBandId: 'INVALID_BAND' }
    expect(deletedAccountsListStateToApiFilters(parsed, 20).minIncomeBandId).toBeUndefined()
  })

  it('maps to API filters without accountStatus', () => {
    const api = deletedAccountsListStateToApiFilters(
      {
        ...defaultDeletedAccountsListUrlState(),
        gender: 'Male',
        status: 'CALL_REMAINING',
      },
      20,
    )
    expect(api).not.toHaveProperty('accountStatus')
    expect(api.gender).toBe('Male')
    expect(api.status).toBe('CALL_REMAINING')
  })

  it('preserves multi-word and trailing-space state/city while typing', () => {
    const midType = {
      ...defaultDeletedAccountsListUrlState(),
      state: 'Uttar ',
      city: 'New ',
    }
    expect(toDeletedAccountsListSearchParams(midType).get('state')).toBe('Uttar ')
    expect(toDeletedAccountsListSearchParams(midType).get('city')).toBe('New ')
    expect(roundTrip(midType)).toEqual(midType)
  })

  it('trims state/city when mapping to API filters', () => {
    const api = deletedAccountsListStateToApiFilters(
      {
        ...defaultDeletedAccountsListUrlState(),
        state: 'Uttar Pradesh ',
        city: ' New Delhi',
      },
      20,
    )
    expect(api.state).toBe('Uttar Pradesh')
    expect(api.city).toBe('New Delhi')
  })

  it('round-trips country + countryIso and maps country to API', () => {
    const state = {
      ...defaultDeletedAccountsListUrlState(),
      country: 'India',
      countryIso: 'IN',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      maritalStatus: 'Widowed',
    }
    expect(roundTrip(state)).toEqual(state)
    const api = deletedAccountsListStateToApiFilters(state, 20)
    expect(api.country).toBe('India')
    expect(api).not.toHaveProperty('countryIso')
  })

  it('round-trips profileCreatedFor and maps to API; omits Any', () => {
    const state = {
      ...defaultDeletedAccountsListUrlState(),
      profileCreatedFor: 'SELF',
    }
    expect(roundTrip(state)).toEqual(state)
    expect(deletedAccountsListStateToApiFilters(state, 20).profileCreatedFor).toBe('SELF')
    expect(
      deletedAccountsListStateToApiFilters(defaultDeletedAccountsListUrlState(), 20).profileCreatedFor,
    ).toBeUndefined()
  })

  it('rejects unknown profileCreatedFor values', () => {
    expect(
      parseDeletedAccountsListSearchParams(new URLSearchParams('profileCreatedFor=Self')).profileCreatedFor,
    ).toBe('')
  })

  it('deletionRangePreset returns datetime-local start/end', () => {
    const range = deletionRangePreset(7)
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})
