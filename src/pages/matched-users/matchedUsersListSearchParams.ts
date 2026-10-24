import type { MatchedSalesLeadsFilters } from '@/api/types'
import { toDatetimeLocalInput, toUtcIso } from '@/utils/date'

/** Max inclusive calendar span the backend accepts (93 days). */
export const MATCHED_USERS_MAX_RANGE_DAYS = 93

export interface MatchedUsersListUrlState {
  start: string
  end: string
  page: number
}

function utcDayStart(daysAgo: number): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo))
}

function utcTomorrowStart(): Date {
  return utcDayStart(-1)
}

/** Today UTC [00:00, tomorrow 00:00) as datetime-local values. */
export function defaultMatchedUsersListUrlState(): MatchedUsersListUrlState {
  const start = utcDayStart(0)
  const end = utcTomorrowStart()
  return {
    start: toDatetimeLocalInput(start.toISOString()),
    end: toDatetimeLocalInput(end.toISOString()),
    page: 0,
  }
}

/** Calendar-day presets in UTC: Today / last N days inclusive of today. */
export function matchedRangePreset(days: 1 | 7 | 30): { start: string; end: string } {
  const start = utcDayStart(days - 1)
  const end = utcTomorrowStart()
  return {
    start: toDatetimeLocalInput(start.toISOString()),
    end: toDatetimeLocalInput(end.toISOString()),
  }
}

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? '0', 10)
  if (Number.isNaN(n) || n < 0) return 0
  return n
}

export function parseMatchedUsersListSearchParams(searchParams: URLSearchParams): MatchedUsersListUrlState {
  const defaults = defaultMatchedUsersListUrlState()
  return {
    start: searchParams.get('start') || defaults.start,
    end: searchParams.get('end') || defaults.end,
    page: parsePage(searchParams.get('page')),
  }
}

export function toMatchedUsersListSearchParams(state: MatchedUsersListUrlState): URLSearchParams {
  const defaults = defaultMatchedUsersListUrlState()
  const p = new URLSearchParams()
  if (state.start && state.start !== defaults.start) p.set('start', state.start)
  if (state.end && state.end !== defaults.end) p.set('end', state.end)
  if (state.page > 0) p.set('page', String(state.page))
  return p
}

export function matchedUsersListStateToApiFilters(
  parsed: MatchedUsersListUrlState,
  pageSize: number,
): MatchedSalesLeadsFilters {
  return {
    start: toUtcIso(parsed.start),
    end: toUtcIso(parsed.end),
    page: parsed.page,
    size: pageSize,
  }
}

/** Returns an error message when start/end span more than 93 days; otherwise null. */
export function matchedUsersRangeError(startLocal: string, endLocal: string): string | null {
  const startIso = toUtcIso(startLocal)
  const endIso = toUtcIso(endLocal)
  if (!startIso || !endIso) return null
  const startMs = new Date(startIso).getTime()
  const endMs = new Date(endIso).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null
  if (endMs <= startMs) return 'End must be after start.'
  const maxMs = MATCHED_USERS_MAX_RANGE_DAYS * 24 * 60 * 60 * 1000
  if (endMs - startMs > maxMs) {
    return `Date range cannot exceed ${MATCHED_USERS_MAX_RANGE_DAYS} days.`
  }
  return null
}
