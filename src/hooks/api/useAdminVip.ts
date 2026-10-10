import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminVipLeadDetailResponse,
  AdminVipLeadSearchResponse,
  AssignSalesLeadRequest,
  UpdateSalesFollowUpRequest,
  UpdateSalesNoteRequest,
  UpdateSalesStatusRequest,
  VipFollowUpsFilters,
  VipLeadsFilters,
} from '@/api/types'
import { VIP_PENDING_STATUSES, sumVipPendingTotals } from '@/pages/vip/vipConstants'

export const ADMIN_VIP_PENDING_COUNT_QUERY_KEY = ['admin-vip-pending-count'] as const

export function useAdminVipLeads(filters: VipLeadsFilters) {
  return useQuery({
    queryKey: ['admin-vip-leads', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminVipLeadSearchResponse>(adminEndpoints.vip.leads, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminVipLeadDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-vip-lead-detail', userId],
    queryFn: async () => {
      const response = await adminClient.get<AdminVipLeadDetailResponse>(
        adminEndpoints.vip.detail(userId ?? ''),
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminVipFollowUps(filters: VipFollowUpsFilters) {
  return useQuery({
    queryKey: ['admin-vip-follow-ups', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminVipLeadSearchResponse>(adminEndpoints.vip.followUps, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

/** Sum of open-status lead totals (excludes CONVERTED / NOT_INTERESTED). */
export function useAdminVipPendingCount() {
  return useQuery({
    queryKey: ADMIN_VIP_PENDING_COUNT_QUERY_KEY,
    queryFn: async () => {
      const responses = await Promise.all(
        VIP_PENDING_STATUSES.map((status) =>
          adminClient.get<AdminVipLeadSearchResponse>(adminEndpoints.vip.leads, {
            params: cleanQueryParams({ status, page: 0, size: 1 }),
          }),
        ),
      )
      return sumVipPendingTotals(responses.map((r) => r.data.total ?? 0))
    },
    refetchInterval: 60_000,
  })
}

function invalidateVipQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['admin-vip-leads'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-vip-lead-detail', userId] })
  void queryClient.invalidateQueries({ queryKey: ['admin-vip-follow-ups'] })
  void queryClient.invalidateQueries({ queryKey: ADMIN_VIP_PENDING_COUNT_QUERY_KEY })
}

export function useUpdateVipStatus(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesStatusRequest) => {
      const response = await adminClient.patch<AdminVipLeadDetailResponse>(
        adminEndpoints.vip.updateStatus(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateVipQueries(queryClient, userId),
  })
}

export function useUpdateVipNote(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesNoteRequest) => {
      const response = await adminClient.patch<AdminVipLeadDetailResponse>(
        adminEndpoints.vip.updateNote(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateVipQueries(queryClient, userId),
  })
}

export function useUpdateVipFollowUp(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesFollowUpRequest) => {
      const response = await adminClient.patch<AdminVipLeadDetailResponse>(
        adminEndpoints.vip.updateFollowUp(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateVipQueries(queryClient, userId),
  })
}

export function useClaimVipLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminVipLeadDetailResponse>(adminEndpoints.vip.claim(userId))
      return response.data
    },
    onSuccess: () => invalidateVipQueries(queryClient, userId),
  })
}

export function useReleaseVipLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminVipLeadDetailResponse>(adminEndpoints.vip.release(userId))
      return response.data
    },
    onSuccess: () => invalidateVipQueries(queryClient, userId),
  })
}

export function useAssignVipLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AssignSalesLeadRequest) => {
      const response = await adminClient.patch<AdminVipLeadDetailResponse>(
        adminEndpoints.vip.assign(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateVipQueries(queryClient, userId),
  })
}
