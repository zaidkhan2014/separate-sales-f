import type { AdminSalesStatus, VipLeadSort, VipLeadsFilters } from '@/api/types'
import { toDatetimeLocalInput, toUtcIso } from '@/utils/date'

/** sessionStorage key for last VIP list query string (no leading `?`). */
export const VIP_LIST_SEARCH_STORAGE_KEY = 'qalbi.admin.vipListSearch'

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

const VIP_SORTS = new Set<string>(['newest', 'oldest', 'follow_up', 'updated'])

export interface VipListUrlState {
  start: string
  end: string
  followUpStart: string
  followUpEnd: string
  status: 'ALL' | AdminSalesStatus
  query: string
  pool: '' | 'true'
  assignedToMe: '' | 'true'
  assignedToAdminId: string
  sort: '' | VipLeadSort
  page: number
}

export const defaultVipListUrlState = (): VipListUrlState => ({
  start: '',
  end: '',
  followUpStart: '',
  followUpEnd: '',
  status: 'ALL',
  query: '',
  pool: '',
  assignedToMe: '',
  assignedToAdminId: '',
  sort: '',
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

export function parseVipListSearchParams(searchParams: URLSearchParams): VipListUrlState {
  const defaults = defaultVipListUrlState()
  const statusRaw = searchParams.get('status') ?? 'ALL'
  const status = SALES_STATUSES.has(statusRaw) ? (statusRaw as VipListUrlState['status']) : defaults.status

  const sortRaw = searchParams.get('sort') ?? ''
  const sort: VipListUrlState['sort'] = VIP_SORTS.has(sortRaw) ? (sortRaw as VipLeadSort) : ''

  return {
    start: searchParams.get('start') ?? '',
    end: searchParams.get('end') ?? '',
    followUpStart: searchParams.get('followUpStart') ?? '',
    followUpEnd: searchParams.get('followUpEnd') ?? '',
    status,
    query: searchParams.get('query') ?? '',
    pool: parseTriFlag(searchParams.get('pool')),
    assignedToMe: parseTriFlag(searchParams.get('assignedToMe')),
    assignedToAdminId: searchParams.get('assignedToAdminId') ?? '',
    sort,
    page: parsePage(searchParams.get('page')),
  }
}

export function toVipListSearchParams(state: VipListUrlState): URLSearchParams {
  const defaults = defaultVipListUrlState()
  const p = new URLSearchParams()

  if (state.start) p.set('start', state.start)
  if (state.end) p.set('end', state.end)
  if (state.followUpStart) p.set('followUpStart', state.followUpStart)
  if (state.followUpEnd) p.set('followUpEnd', state.followUpEnd)
  if (state.status !== defaults.status) p.set('status', state.status)
  if (state.query) p.set('query', state.query)
  if (state.pool === 'true') p.set('pool', 'true')
  if (state.assignedToMe === 'true') p.set('assignedToMe', 'true')
  if (state.assignedToAdminId.trim()) p.set('assignedToAdminId', state.assignedToAdminId)
  if (state.sort) p.set('sort', state.sort)
  if (state.page > 0) p.set('page', String(state.page))

  return p
}

export function serializeVipListFiltersForStorage(state: VipListUrlState): string {
  return toVipListSearchParams(state).toString()
}

export function vipListStateToApiFilters(parsed: VipListUrlState, pageSize: number): VipLeadsFilters {
  return {
    start: toUtcIso(parsed.start),
    end: toUtcIso(parsed.end),
    status: parsed.status === 'ALL' ? undefined : parsed.status,
    followUpStart: toUtcIso(parsed.followUpStart),
    followUpEnd: toUtcIso(parsed.followUpEnd),
    query: parsed.query.trim() || undefined,
    pool: parsed.pool === 'true' ? true : undefined,
    assignedToMe: parsed.assignedToMe === 'true' ? true : undefined,
    assignedToAdminId: parsed.assignedToAdminId.trim() || undefined,
    sort: parsed.sort || undefined,
    page: parsed.page,
    size: pageSize,
  }
}

export type VipListViewPreset = 'all' | 'pool' | 'my_leads'

export function vipListPresetPatch(preset: VipListViewPreset): Partial<VipListUrlState> {
  if (preset === 'pool') {
    return { pool: 'true', assignedToMe: '', page: 0 }
  }
  if (preset === 'my_leads') {
    return { assignedToMe: 'true', pool: '', page: 0 }
  }
  return { pool: '', assignedToMe: '', page: 0 }
}

export function activeVipListPreset(parsed: VipListUrlState): VipListViewPreset {
  if (parsed.pool === 'true') return 'pool'
  if (parsed.assignedToMe === 'true') return 'my_leads'
  return 'all'
}

/** Client-side last-requested date presets (7 / 30 / 90 days). */
export function vipRequestedRangePreset(days: 7 | 30 | 90): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - days * 86400000)
  return {
    start: toDatetimeLocalInput(start.toISOString()),
    end: toDatetimeLocalInput(end.toISOString()),
  }
}
