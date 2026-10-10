import type { AdminSalesStatus } from '@/api/types'

/** Open (non-terminal) VIP statuses used for the nav pending badge. */
export const VIP_PENDING_STATUSES: AdminSalesStatus[] = [
  'CALL_REMAINING',
  'IN_PROCESS',
  'ALREADY_CALLED',
  'CALL_NOT_PICKED',
  'CALL_BACK_LATER',
  'INTERESTED',
]

export function sumVipPendingTotals(totals: number[]): number {
  return totals.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0)
}

/** WhatsApp-style badge label: cap at 99+. */
export function formatVipPendingBadge(count: number): string {
  if (count <= 0) return ''
  return count >= 100 ? '99+' : String(count)
}
