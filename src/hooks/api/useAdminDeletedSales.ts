import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminDeletedSalesLeadDetailResponse,
  AdminDeletedSalesLeadSearchResponse,
  AdminMetricsResponse,
  AdminSalesActivitySearchResponse,
  AdminSalesAgentPerformanceResponse,
  AdminSalesSavedViewSearchResponse,
  AdminSalesSavedViewSummary,
  AssignSalesLeadRequest,
  CreateAdminSalesCommunicationRequest,
  CreateAdminSalesSavedViewRequest,
  DeletedSalesLeadsFilters,
  SalesActivitiesFilters,
  SalesAgentPerformanceFilters,
  SalesFollowUpsFilters,
  UpdateAdminSalesSavedViewRequest,
  UpdateSalesFollowUpRequest,
  UpdateSalesNoteRequest,
  UpdateSalesStatusRequest,
} from '@/api/types'

export function useAdminDeletedSalesLeads(filters: DeletedSalesLeadsFilters) {
  return useQuery({
    queryKey: ['admin-deleted-sales-leads', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminDeletedSalesLeadSearchResponse>(
        adminEndpoints.salesDeleted.leads,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminDeletedSalesSummary(filters: Pick<DeletedSalesLeadsFilters, 'start' | 'end'>) {
  return useQuery({
    queryKey: ['admin-deleted-sales-summary', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.salesDeleted.summary, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminDeletedSalesLeadDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-deleted-sales-lead-detail', userId],
    queryFn: async () => {
      const response = await adminClient.get<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.detail(userId ?? ''),
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminDeletedSalesFollowUps(filters: SalesFollowUpsFilters) {
  return useQuery({
    queryKey: ['admin-deleted-sales-follow-ups', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminDeletedSalesLeadSearchResponse>(
        adminEndpoints.salesDeleted.followUps,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminDeletedSalesActivities(userId: string | undefined, filters: SalesActivitiesFilters = {}) {
  return useQuery({
    queryKey: ['admin-deleted-sales-activities', userId, filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesActivitySearchResponse>(
        adminEndpoints.salesDeleted.activities(userId ?? ''),
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminDeletedSalesAgentPerformance(filters: SalesAgentPerformanceFilters) {
  return useQuery({
    queryKey: ['admin-deleted-sales-agent-performance', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesAgentPerformanceResponse>(
        adminEndpoints.salesDeleted.agentPerformance,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminDeletedSalesSavedViews() {
  return useQuery({
    queryKey: ['admin-deleted-sales-saved-views'],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesSavedViewSearchResponse>(
        adminEndpoints.salesDeleted.savedViews,
      )
      return response.data
    },
  })
}

function invalidateDeletedLeadQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-leads'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-summary'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-lead-detail', userId] })
  void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-follow-ups'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-activities', userId] })
}

export function useUpdateDeletedSalesStatus(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesStatusRequest) => {
      const response = await adminClient.patch<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.updateStatus(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useUpdateDeletedSalesNote(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesNoteRequest) => {
      const response = await adminClient.patch<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.updateNote(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useUpdateDeletedSalesFollowUp(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesFollowUpRequest) => {
      const response = await adminClient.patch<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.updateFollowUp(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useClaimDeletedSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.claim(userId),
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useReleaseDeletedSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.release(userId),
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useAssignDeletedSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AssignSalesLeadRequest) => {
      const response = await adminClient.patch<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.assign(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useLogDeletedSalesCommunication(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAdminSalesCommunicationRequest) => {
      const response = await adminClient.post<AdminDeletedSalesLeadDetailResponse>(
        adminEndpoints.salesDeleted.communications(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateDeletedLeadQueries(queryClient, userId),
  })
}

export function useCreateDeletedSalesSavedView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAdminSalesSavedViewRequest) => {
      const response = await adminClient.post<AdminSalesSavedViewSummary>(
        adminEndpoints.salesDeleted.savedViews,
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-saved-views'] })
    },
  })
}

export function useUpdateDeletedSalesSavedView(viewId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateAdminSalesSavedViewRequest) => {
      const response = await adminClient.patch<AdminSalesSavedViewSummary>(
        adminEndpoints.salesDeleted.savedView(viewId),
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-saved-views'] })
    },
  })
}

export function useDeleteDeletedSalesSavedView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (viewId: string) => {
      await adminClient.delete(adminEndpoints.salesDeleted.savedView(viewId))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-deleted-sales-saved-views'] })
    },
  })
}
