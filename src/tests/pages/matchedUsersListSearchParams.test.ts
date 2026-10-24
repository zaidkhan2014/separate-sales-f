import { describe, expect, it } from 'vitest'
import {
  MATCHED_USERS_MAX_RANGE_DAYS,
  defaultMatchedUsersListUrlState,
  matchedRangePreset,
  matchedUsersListStateToApiFilters,
  matchedUsersRangeError,
  parseMatchedUsersListSearchParams,
  toMatchedUsersListSearchParams,
} from '@/pages/matched-users/matchedUsersListSearchParams'

describe('matchedUsersListSearchParams', () => {
  it('defaults to today UTC window', () => {
    const defaults = defaultMatchedUsersListUrlState()
    expect(defaults.start).toBeTruthy()
    expect(defaults.end).toBeTruthy()
    expect(defaults.page).toBe(0)

    const filters = matchedUsersListStateToApiFilters(defaults, 20)
    expect(filters.start).toBeTruthy()
    expect(filters.end).toBeTruthy()
    expect(filters.page).toBe(0)
    expect(filters.size).toBe(20)
  })

  it('parses page from search params and omits default dates from serialization', () => {
    const parsed = parseMatchedUsersListSearchParams(new URLSearchParams('page=2'))
    expect(parsed.page).toBe(2)
    const serialized = toMatchedUsersListSearchParams(parsed)
    expect(serialized.get('page')).toBe('2')
    expect(serialized.has('start')).toBe(false)
    expect(serialized.has('end')).toBe(false)
  })

  it('builds today / 7d / 30d presets without range errors', () => {
    for (const days of [1, 7, 30] as const) {
      const range = matchedRangePreset(days)
      expect(matchedUsersRangeError(range.start, range.end)).toBeNull()
    }
  })

  it(`rejects ranges wider than ${MATCHED_USERS_MAX_RANGE_DAYS} days`, () => {
    const start = '2026-01-01T00:00'
    const end = '2026-05-01T00:00'
    expect(matchedUsersRangeError(start, end)).toContain(String(MATCHED_USERS_MAX_RANGE_DAYS))
  })

  it('rejects end before start', () => {
    expect(matchedUsersRangeError('2026-10-16T00:00', '2026-10-15T00:00')).toBe(
      'End must be after start.',
    )
  })
})
