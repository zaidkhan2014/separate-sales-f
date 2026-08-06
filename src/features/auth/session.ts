import type { AdminStaffSummary, AdminTokenResponse } from '@/api/types'

const AUTH_KEY = 'qalbi.sales.session'

export interface AdminSession extends AdminTokenResponse {
  /** Staff email/password login */
  staff?: AdminStaffSummary
}

let inMemorySession: AdminSession | null = null

export function getSession() {
  if (inMemorySession) {
    return inMemorySession
  }

  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) {
    return null
  }

  try {
    inMemorySession = JSON.parse(raw) as AdminSession
    return inMemorySession
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

export function setSession(session: AdminSession) {
  inMemorySession = session
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearSession() {
  inMemorySession = null
  localStorage.removeItem(AUTH_KEY)
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null
}

export function getStaffEmployeeId(): string | null {
  const session = getSession()
  if (!session) return null
  return session.staff?.employeeId ?? null
}

export function hasRole(session: AdminSession | null, role: string): boolean {
  return session?.roles?.includes(role) ?? false
}

export function isSalesAgent(session: AdminSession | null): boolean {
  return hasRole(session, 'ROLE_SALES_AGENT')
}

export function isSalesManagerOrAbove(session: AdminSession | null): boolean {
  if (!session) return false
  return (
    hasRole(session, 'ROLE_ADMIN') ||
    session.staff?.role === 'SUPER_ADMIN' ||
    session.staff?.role === 'SALES_MANAGER'
  )
}
