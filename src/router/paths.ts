export const routes = {
  login: '/login',
  leads: '/leads',
  leadDetail: (userId: string) => `/leads/${userId}`,
  followUps: '/follow-ups',
  performance: '/performance',
  deletedAccounts: '/deleted-accounts',
  deletedAccountsFollowUps: '/deleted-accounts/follow-ups',
  deletedAccountsPerformance: '/deleted-accounts/performance',
  deletedAccountsLeadDetail: (userId: string) => `/deleted-accounts/${userId}`,
} as const
