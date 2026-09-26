import type { AdminSalesStatus, DeletedSalesLeadsFilters, ProfileStatus } from '@/api/types'
import { findFallbackCountryByIso2, findFallbackCountryByName } from '@/data/fallbackCountries'
import { birthYearForLeadsApi, parseProfileCreatedForFilter, parseSalesMaritalStatus } from '@/pages/sales/salesConstants'
import { isValidMinIncomeBandId } from '@/pages/sales/salesIncomeBands'
import { toDatetimeLocalInput, toUtcIso } from '@/utils/date'

/** sessionStorage key for last Deleted Accounts list query string (no leading `?`). */
export const DELETED_ACCOUNTS_LIST_SEARCH_STORAGE_KEY = 'qalbi.sales.deletedAccountsListSearch'

const SALES_STATUSES = new Set<string>([
  'ALL',
  'CALL_REMAINING',
  'IN_PROCESS',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
  'NOT_INTERESTED',
  'CONVERTED',
])

const PROFILE = new Set<string>(['APPROVED', 'ANY', 'PENDING', 'REJECTED'])

export interface DeletedAccountsListUrlState {
  start: string
  end: string
  followUpStart: string
  followUpEnd: string
  status: 'ALL' | AdminSalesStatus
  query: string
  profileStatus: ProfileStatus | 'ANY'
  gender: string
  birthYear: string
  maritalStatus: string
  profileCreatedFor: string
  country: string
  countryIso: string
  state: string
  city: string
  minIncomeBandId: string
  pool: '' | 'true'
  assignedToMe: '' | 'true'
  assignedToAdminId: string
  sort: '' | 'leadScore'
  subscribedTri: '' | 'true' | 'false'
  verifiedTri: '' | 'true' | 'false'
  page: number
}

export const defaultDeletedAccountsListUrlState = (): DeletedAccountsListUrlState => ({
  start: '',
  end: '',
  followUpStart: '',
  followUpEnd: '',
  status: 'ALL',
  query: '',
  profileStatus: 'APPROVED',
  gender: '',
  birthYear: '',
  maritalStatus: '',
  profileCreatedFor: '',
  country: '',
  countryIso: '',
  state: '',
  city: '',
  minIncomeBandId: '',
  pool: '',
  assignedToMe: '',
  assignedToAdminId: '',
  sort: '',
  subscribedTri: '',
  verifiedTri: '',
  page: 0,
})

function parsePage(raw: string | null): number {
  const n = parseInt(raw ?? '0', 10)
  if (Number.isNaN(n) || n < 0) return 0
  return n
}

function parseTriFlag(raw: string | null): '' | 'true' {
  return raw === 'true' ? 'true' : ''
}

export function parseDeletedAccountsListSearchParams(searchParams: URLSearchParams): DeletedAccountsListUrlState {
  const defaults = defaultDeletedAccountsListUrlState()
  const statusRaw = searchParams.get('status') ?? 'ALL'
  const status = SALES_STATUSES.has(statusRaw)
    ? (statusRaw as DeletedAccountsListUrlState['status'])
    : defaults.status

  const profileRaw = searchParams.get('profileStatus') ?? defaults.profileStatus
  const profileStatus = PROFILE.has(profileRaw)
    ? (profileRaw as DeletedAccountsListUrlState['profileStatus'])
    : defaults.profileStatus

  const sub = searchParams.get('subscribed')
  const subscribedTri: DeletedAccountsListUrlState['subscribedTri'] =
    sub === 'true' || sub === 'false' ? sub : ''

  const ver = searchParams.get('verifiedProfile')
  const verifiedTri: DeletedAccountsListUrlState['verifiedTri'] =
    ver === 'true' || ver === 'false' ? ver : ''

  const sortRaw = searchParams.get('sort')
  const sort: DeletedAccountsListUrlState['sort'] = sortRaw === 'leadScore' ? 'leadScore' : ''

  const minIncomeRaw = searchParams.get('minIncomeBandId') ?? ''
  const minIncomeBandId = isValidMinIncomeBandId(minIncomeRaw) ? minIncomeRaw : ''

  const countryIsoRaw = (searchParams.get('countryIso') ?? '').trim().toUpperCase()
  const countryNameRaw = searchParams.get('country') ?? ''
  let countryIso = ''
  let country = ''
  if (countryIsoRaw && findFallbackCountryByIso2(countryIsoRaw)) {
    countryIso = countryIsoRaw
    country = findFallbackCountryByIso2(countryIsoRaw)?.name ?? ''
  } else if (countryNameRaw.trim()) {
    const byName = findFallbackCountryByName(countryNameRaw)
    if (byName) {
      countryIso = byName.iso2
      country = byName.name
    }
  }

  return {
    start: searchParams.get('start') ?? '',
    end: searchParams.get('end') ?? '',
    followUpStart: searchParams.get('followUpStart') ?? '',
    followUpEnd: searchParams.get('followUpEnd') ?? '',
    status,
    query: searchParams.get('query') ?? '',
    profileStatus,
    gender: searchParams.get('gender') ?? '',
    birthYear: searchParams.get('birthYear') ?? '',
    maritalStatus: parseSalesMaritalStatus(searchParams.get('maritalStatus')),
    profileCreatedFor: parseProfileCreatedForFilter(searchParams.get('profileCreatedFor')),
    country,
    countryIso,
    state: searchParams.get('state') ?? '',
    city: searchParams.get('city') ?? '',
    minIncomeBandId,
    pool: parseTriFlag(searchParams.get('pool')),
    assignedToMe: parseTriFlag(searchParams.get('assignedToMe')),
    assignedToAdminId: searchParams.get('assignedToAdminId') ?? '',
    sort,
    subscribedTri,
    verifiedTri,
    page: parsePage(searchParams.get('page')),
  }
}

export function toDeletedAccountsListSearchParams(state: DeletedAccountsListUrlState): URLSearchParams {
  const defaults = defaultDeletedAccountsListUrlState()
  const p = new URLSearchParams()

  if (state.start) p.set('start', state.start)
  if (state.end) p.set('end', state.end)
  if (state.followUpStart) p.set('followUpStart', state.followUpStart)
  if (state.followUpEnd) p.set('followUpEnd', state.followUpEnd)
  if (state.status !== defaults.status) p.set('status', state.status)
  if (state.query) p.set('query', state.query)
  if (state.profileStatus !== defaults.profileStatus) p.set('profileStatus', state.profileStatus)
  if (state.gender.trim()) p.set('gender', state.gender)
  if (state.birthYear.trim()) p.set('birthYear', state.birthYear.trim())
  if (state.maritalStatus.trim()) p.set('maritalStatus', state.maritalStatus)
  if (state.profileCreatedFor.trim()) p.set('profileCreatedFor', state.profileCreatedFor)
  if (state.country.trim()) p.set('country', state.country)
  if (state.countryIso.trim()) p.set('countryIso', state.countryIso)
  if (state.state.trim()) p.set('state', state.state)
  if (state.city.trim()) p.set('city', state.city)
  if (isValidMinIncomeBandId(state.minIncomeBandId)) p.set('minIncomeBandId', state.minIncomeBandId)
  if (state.pool === 'true') p.set('pool', 'true')
  if (state.assignedToMe === 'true') p.set('assignedToMe', 'true')
  if (state.assignedToAdminId.trim()) p.set('assignedToAdminId', state.assignedToAdminId)
  if (state.sort === 'leadScore') p.set('sort', 'leadScore')
  if (state.subscribedTri) p.set('subscribed', state.subscribedTri)
  if (state.verifiedTri) p.set('verifiedProfile', state.verifiedTri)
  if (state.page > 0) p.set('page', String(state.page))

  return p
}

export function serializeDeletedAccountsFiltersForStorage(state: DeletedAccountsListUrlState): string {
  return toDeletedAccountsListSearchParams(state).toString()
}

export function deletedAccountsListStateToApiFilters(
  parsed: DeletedAccountsListUrlState,
  pageSize: number,
): DeletedSalesLeadsFilters {
  return {
    start: toUtcIso(parsed.start),
    end: toUtcIso(parsed.end),
    status: parsed.status || 'ALL',
    followUpStart: toUtcIso(parsed.followUpStart),
    followUpEnd: toUtcIso(parsed.followUpEnd),
    query: parsed.query.trim() || undefined,
    profileStatus: parsed.profileStatus === 'ANY' ? undefined : parsed.profileStatus,
    gender: parsed.gender.trim() || undefined,
    birthYear: birthYearForLeadsApi(parsed.birthYear),
    maritalStatus: parsed.maritalStatus.trim() || undefined,
    profileCreatedFor: parseProfileCreatedForFilter(parsed.profileCreatedFor) || undefined,
    country: parsed.country.trim() || undefined,
    state: parsed.state.trim() || undefined,
    city: parsed.city.trim() || undefined,
    minIncomeBandId: isValidMinIncomeBandId(parsed.minIncomeBandId) ? parsed.minIncomeBandId : undefined,
    pool: parsed.pool === 'true' ? true : undefined,
    assignedToMe: parsed.assignedToMe === 'true' ? true : undefined,
    assignedToAdminId: parsed.assignedToAdminId.trim() || undefined,
    sort: parsed.sort === 'leadScore' ? 'leadScore' : undefined,
    subscribed: parsed.subscribedTri === '' ? undefined : parsed.subscribedTri === 'true',
    verifiedProfile: parsed.verifiedTri === '' ? undefined : parsed.verifiedTri === 'true',
    page: parsed.page,
    size: pageSize,
  }
}

export type DeletedAccountsListViewPreset = 'all' | 'pool' | 'my_leads'

export function deletedAccountsListPresetPatch(
  preset: DeletedAccountsListViewPreset,
): Partial<DeletedAccountsListUrlState> {
  if (preset === 'pool') {
    return { pool: 'true', assignedToMe: '', page: 0 }
  }
  if (preset === 'my_leads') {
    return { assignedToMe: 'true', pool: '', page: 0 }
  }
  return { pool: '', assignedToMe: '', page: 0 }
}

export function activeDeletedAccountsListPreset(
  parsed: DeletedAccountsListUrlState,
): DeletedAccountsListViewPreset {
  if (parsed.pool === 'true') return 'pool'
  if (parsed.assignedToMe === 'true') return 'my_leads'
  return 'all'
}

/** Client-side deletion date presets (7 / 30 / 90 days) as datetime-local values. */
export function deletionRangePreset(days: 7 | 30 | 90): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - days * 86400000)
  return {
    start: toDatetimeLocalInput(start.toISOString()),
    end: toDatetimeLocalInput(end.toISOString()),
  }
}
