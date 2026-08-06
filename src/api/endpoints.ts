export const ADMIN_API_BASE = '/api/admin'

export const adminEndpoints = {
  authLogin: `${ADMIN_API_BASE}/auth/login`,
  sales: {
    leads: `${ADMIN_API_BASE}/sales/leads`,
    detail: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}`,
    updateStatus: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/status`,
    updateNote: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/note`,
    updateFollowUp: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/follow-up`,
    claim: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/claim`,
    release: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/release`,
    assign: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/assign`,
    followUps: `${ADMIN_API_BASE}/sales/follow-ups`,
    activities: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/activities`,
    communications: (userId: string) => `${ADMIN_API_BASE}/sales/leads/${userId}/communications`,
    agentPerformance: `${ADMIN_API_BASE}/sales/agents/performance`,
    savedViews: `${ADMIN_API_BASE}/sales/saved-views`,
    savedView: (viewId: string) => `${ADMIN_API_BASE}/sales/saved-views/${viewId}`,
    summary: `${ADMIN_API_BASE}/sales/summary`,
  },
} as const
