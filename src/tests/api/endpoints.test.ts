import { describe, expect, it } from 'vitest'
import { adminEndpoints } from '@/api/endpoints'

describe('adminEndpoints', () => {
  it('creates sales endpoints', () => {
    expect(adminEndpoints.sales.leads).toBe('/api/admin/sales/leads')
    expect(adminEndpoints.sales.detail('user-1')).toBe('/api/admin/sales/leads/user-1')
    expect(adminEndpoints.sales.updateStatus('user-1')).toBe('/api/admin/sales/leads/user-1/status')
    expect(adminEndpoints.sales.updateNote('user-1')).toBe('/api/admin/sales/leads/user-1/note')
    expect(adminEndpoints.sales.updateFollowUp('user-1')).toBe('/api/admin/sales/leads/user-1/follow-up')
    expect(adminEndpoints.sales.claim('user-1')).toBe('/api/admin/sales/leads/user-1/claim')
    expect(adminEndpoints.sales.release('user-1')).toBe('/api/admin/sales/leads/user-1/release')
    expect(adminEndpoints.sales.assign('user-1')).toBe('/api/admin/sales/leads/user-1/assign')
    expect(adminEndpoints.sales.followUps).toBe('/api/admin/sales/follow-ups')
    expect(adminEndpoints.sales.activities('user-1')).toBe('/api/admin/sales/leads/user-1/activities')
    expect(adminEndpoints.sales.communications('user-1')).toBe('/api/admin/sales/leads/user-1/communications')
    expect(adminEndpoints.sales.agentPerformance).toBe('/api/admin/sales/agents/performance')
    expect(adminEndpoints.sales.savedViews).toBe('/api/admin/sales/saved-views')
    expect(adminEndpoints.sales.savedView('view-1')).toBe('/api/admin/sales/saved-views/view-1')
    expect(adminEndpoints.sales.summary).toBe('/api/admin/sales/summary')
  })

  it('exposes auth login endpoint', () => {
    expect(adminEndpoints.authLogin).toBe('/api/admin/auth/login')
  })
})
