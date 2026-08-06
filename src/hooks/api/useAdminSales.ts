import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminMetricsResponse,
  AdminSalesActivitySearchResponse,
  AdminSalesAgentPerformanceResponse,
  AdminSalesLeadDetailResponse,
  AdminSalesLeadSearchResponse,
  AdminSalesSavedViewSearchResponse,
  AdminSalesSavedViewSummary,
  AssignSalesLeadRequest,
  CreateAdminSalesCommunicationRequest,
  CreateAdminSalesSavedViewRequest,
  SalesActivitiesFilters,
  SalesAgentPerformanceFilters,
  SalesFollowUpsFilters,
  SalesLeadsFilters,
  UpdateSalesFollowUpRequest,
  UpdateSalesNoteRequest,
  UpdateAdminSalesSavedViewRequest,
  UpdateSalesStatusRequest,
} from '@/api/types'

export function useAdminSalesLeads(filters: SalesLeadsFilters) {
  return useQuery({
    queryKey: ['admin-sales-leads', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadSearchResponse>(adminEndpoints.sales.leads, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminSalesSummary(filters: Pick<SalesLeadsFilters, 'start' | 'end'>) {
  return useQuery({
    queryKey: ['admin-sales-summary', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.sales.summary, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminSalesLeadDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-sales-lead-detail', userId],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.detail(userId ?? ''),
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminSalesFollowUps(filters: SalesFollowUpsFilters) {
  return useQuery({
    queryKey: ['admin-sales-follow-ups', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadSearchResponse>(adminEndpoints.sales.followUps, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminSalesActivities(userId: string | undefined, filters: SalesActivitiesFilters = {}) {
  return useQuery({
    queryKey: ['admin-sales-activities', userId, filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesActivitySearchResponse>(
        adminEndpoints.sales.activities(userId ?? ''),
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminSalesAgentPerformance(filters: SalesAgentPerformanceFilters) {
  return useQuery({
    queryKey: ['admin-sales-agent-performance', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesAgentPerformanceResponse>(
        adminEndpoints.sales.agentPerformance,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminSalesSavedViews() {
  return useQuery({
    queryKey: ['admin-sales-saved-views'],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesSavedViewSearchResponse>(adminEndpoints.sales.savedViews)
      return response.data
    },
  })
}

function invalidateLeadQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['admin-sales-leads'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-sales-summary'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-sales-lead-detail', userId] })
  void queryClient.invalidateQueries({ queryKey: ['admin-sales-follow-ups'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-sales-activities', userId] })
}

export function useUpdateSalesStatus(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesStatusRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.updateStatus(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useUpdateSalesNote(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesNoteRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.updateNote(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useUpdateSalesFollowUp(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesFollowUpRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.updateFollowUp(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useClaimSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminSalesLeadDetailResponse>(adminEndpoints.sales.claim(userId))
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useReleaseSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminSalesLeadDetailResponse>(adminEndpoints.sales.release(userId))
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useAssignSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AssignSalesLeadRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.assign(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useLogSalesCommunication(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAdminSalesCommunicationRequest) => {
      const response = await adminClient.post<AdminSalesLeadDetailResponse>(
        adminEndpoints.sales.communications(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateLeadQueries(queryClient, userId),
  })
}

export function useCreateSalesSavedView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAdminSalesSavedViewRequest) => {
      const response = await adminClient.post<AdminSalesSavedViewSummary>(adminEndpoints.sales.savedViews, body)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-saved-views'] })
    },
  })
}

export function useUpdateSalesSavedView(viewId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateAdminSalesSavedViewRequest) => {
      const response = await adminClient.patch<AdminSalesSavedViewSummary>(
        adminEndpoints.sales.savedView(viewId),
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-saved-views'] })
    },
  })
}

export function useDeleteSalesSavedView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (viewId: string) => {
      await adminClient.delete(adminEndpoints.sales.savedView(viewId))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sales-saved-views'] })
    },
  })
}
