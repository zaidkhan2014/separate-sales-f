export const routes = {
  login: '/login',
  leads: '/leads',
  leadDetail: (userId: string) => `/leads/${userId}`,
  followUps: '/follow-ups',
  performance: '/performance',
} as const
