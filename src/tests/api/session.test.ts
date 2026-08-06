import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, getAccessToken, getSession, getStaffEmployeeId, setSession } from '@/features/auth/session'

describe('auth session storage', () => {
  beforeEach(() => {
    clearSession()
  })

  it('stores and retrieves session token', () => {
    setSession({
      accessToken: 'token-123',
      expiresAt: new Date().toISOString(),
      roles: ['ROLE_ADMIN'],
      scope: 'full_access',
      sessionId: 'session-1',
    })

    expect(getSession()?.accessToken).toBe('token-123')
    expect(getAccessToken()).toBe('token-123')
  })

  it('returns staff employeeId when present', () => {
    setSession({
      accessToken: 'token-123',
      expiresAt: new Date().toISOString(),
      roles: ['ROLE_ADMIN', 'ROLE_SALES_AGENT'],
      scope: 'admin_access',
      sessionId: 'session-1',
      staff: {
        id: 'mongo-id',
        employeeId: 'SALES001',
        name: 'Agent',
        email: 'a@test.com',
        phone: null,
        role: 'SALES_AGENT',
        status: 'ACTIVE',
        createdAt: null,
        updatedAt: null,
        lastLoginAt: null,
      },
    })
    expect(getStaffEmployeeId()).toBe('SALES001')
  })
})
