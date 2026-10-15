import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type { AdminUserDetailResponse, AdminUserSearchResponse, UserSearchFilters } from '@/api/types'

export type UserListMode = 'search' | 'newly-joined' | 'profile-rejected' | 'bio-rejected' | 'deleted'

function getUserListEndpoint(mode: UserListMode) {
  switch (mode) {
    case 'newly-joined':
      return adminEndpoints.users.newlyJoined
    case 'profile-rejected':
      return adminEndpoints.users.profileRejected
    case 'bio-rejected':
      return adminEndpoints.users.bioRejected
    case 'deleted':
      return adminEndpoints.users.deleted
    default:
      return adminEndpoints.users.search
  }
}

function getUserListParams(mode: UserListMode, params: UserSearchFilters) {
  if (mode === 'search') {
    return cleanQueryParams(params)
  }
  const { page, size, createdStart, createdEnd, gender } = params
  return cleanQueryParams({
    start: createdStart,
    end: createdEnd,
    gender: mode === 'deleted' ? gender : undefined,
    page,
    size,
  })
}

export function useAdminUsersSearch(params: UserSearchFilters, mode: UserListMode = 'search') {
  return useQuery({
    queryKey: ['admin-users-search', mode, params],
    queryFn: async () => {
      const response = await adminClient.get<AdminUserSearchResponse>(getUserListEndpoint(mode), {
        params: getUserListParams(mode, params),
      })
      return response.data
    },
  })
}

export function useAdminUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const response = await adminClient.get<AdminUserDetailResponse>(adminEndpoints.users.detail(userId ?? ''))
      return response.data
    },
    enabled: Boolean(userId),
  })
}
