import type { AdminSalesOutcomeReason, AdminSalesStatus } from '@/api/types'

export const ADMIN_SALES_STATUSES: AdminSalesStatus[] = [
  'CALL_REMAINING',
  'IN_PROCESS',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
  'NOT_INTERESTED',
  'CONVERTED',
]

export const ADMIN_SALES_STATUS_FILTER_OPTIONS = ['ALL', ...ADMIN_SALES_STATUSES] as const

export const SALES_MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Widowed',
  'Separated',
] as const

export type SalesMaritalStatusOption = (typeof SALES_MARITAL_STATUS_OPTIONS)[number]

const SALES_MARITAL_STATUS_SET = new Set<string>(SALES_MARITAL_STATUS_OPTIONS)

export function parseSalesMaritalStatus(raw: string | null | undefined): string {
  if (!raw) return ''
  return SALES_MARITAL_STATUS_SET.has(raw) ? raw : ''
}

/** Query filter for basicDetails.profileCreatedFor buckets (omit = Any). */
export const PROFILE_CREATED_FOR_FILTER_OPTIONS = [
  { value: 'SELF', label: 'Self' },
  { value: 'NON_SELF', label: 'Non-self' },
] as const

export type ProfileCreatedForFilterOption = (typeof PROFILE_CREATED_FOR_FILTER_OPTIONS)[number]['value']

const PROFILE_CREATED_FOR_FILTER_SET = new Set<string>(
  PROFILE_CREATED_FOR_FILTER_OPTIONS.map((option) => option.value),
)

export function parseProfileCreatedForFilter(raw: string | null | undefined): '' | ProfileCreatedForFilterOption {
  if (!raw) return ''
  return PROFILE_CREATED_FOR_FILTER_SET.has(raw) ? (raw as ProfileCreatedForFilterOption) : ''
}

export const ADMIN_SALES_OUTCOME_REASONS: AdminSalesOutcomeReason[] = [
  'PRICE_ISSUE',
  'NOT_LOOKING_NOW',
  'WRONG_NUMBER',
  'NO_RESPONSE',
  'ALREADY_MARRIED',
  'COMPETITOR',
  'LANGUAGE_BARRIER',
  'OTHER',
]

export const SALES_SUMMARY_METRIC_LABELS: Record<string, string> = {
  sales_total_leads: 'Total leads',
  sales_call_remaining: 'Call remaining',
  sales_in_process: 'In process',
  sales_already_called: 'Already called',
  sales_call_not_picked: 'Call not picked',
  sales_call_back_later: 'Call back later',
  sales_interested: 'Interested',
  sales_not_interested: 'Not interested',
  sales_converted: 'Converted',
  sales_follow_up_due_today: 'Follow-up due today',
  sales_follow_up_overdue: 'Follow-up overdue',
}

export function salesSummaryMetricLabel(key: string): string {
  return SALES_SUMMARY_METRIC_LABELS[key] ?? key.replace(/_/g, ' ')
}

export const STATUSES_REQUIRING_OUTCOME_REASON: AdminSalesStatus[] = ['NOT_INTERESTED', 'CALL_NOT_PICKED']

export function statusRequiresOutcomeReason(status: AdminSalesStatus): boolean {
  return STATUSES_REQUIRING_OUTCOME_REASON.includes(status)
}

/** Include in GET /sales/leads only when a valid year (1900–2100) to avoid API 400 */
export function birthYearForLeadsApi(raw: string): number | undefined {
  const t = raw.trim()
  if (!t) return undefined
  if (!/^\d+$/.test(t)) return undefined
  const n = Number(t)
  if (!Number.isInteger(n) || n < 1900 || n > 2100) return undefined
  return n
}
