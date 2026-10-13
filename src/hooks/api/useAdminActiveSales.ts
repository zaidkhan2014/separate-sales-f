import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminSalesLeadDetailResponse,
  AdminActiveSalesLeadSearchResponse,
  AdminMetricsResponse,
  AdminSalesActivitySearchResponse,
  AdminSalesAgentPerformanceResponse,
  AdminSalesSavedViewSearchResponse,
  AdminSalesSavedViewSummary,
  AssignSalesLeadRequest,
  CreateAdminSalesCommunicationRequest,
  CreateAdminSalesSavedViewRequest,
  ActiveSalesLeadsFilters,
  SalesActivitiesFilters,
  SalesAgentPerformanceFilters,
  SalesFollowUpsFilters,
  UpdateAdminSalesSavedViewRequest,
  UpdateSalesFollowUpRequest,
  UpdateSalesNoteRequest,
  UpdateSalesStatusRequest,
} from '@/api/types'

export function useAdminActiveSalesLeads(filters: ActiveSalesLeadsFilters) {
  return useQuery({
    queryKey: ['admin-active-sales-leads', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminActiveSalesLeadSearchResponse>(
        adminEndpoints.salesActive.leads,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminActiveSalesSummary(filters: Pick<ActiveSalesLeadsFilters, 'start' | 'end'>) {
  return useQuery({
    queryKey: ['admin-active-sales-summary', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.salesActive.summary, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useAdminActiveSalesLeadDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-active-sales-lead-detail', userId],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.detail(userId ?? ''),
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminActiveSalesFollowUps(filters: SalesFollowUpsFilters) {
  return useQuery({
    queryKey: ['admin-active-sales-follow-ups', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminActiveSalesLeadSearchResponse>(
        adminEndpoints.salesActive.followUps,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminActiveSalesActivities(userId: string | undefined, filters: SalesActivitiesFilters = {}) {
  return useQuery({
    queryKey: ['admin-active-sales-activities', userId, filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesActivitySearchResponse>(
        adminEndpoints.salesActive.activities(userId ?? ''),
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
    enabled: Boolean(userId),
  })
}

export function useAdminActiveSalesAgentPerformance(filters: SalesAgentPerformanceFilters) {
  return useQuery({
    queryKey: ['admin-active-sales-agent-performance', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesAgentPerformanceResponse>(
        adminEndpoints.salesActive.agentPerformance,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
  })
}

export function useAdminActiveSalesSavedViews() {
  return useQuery({
    queryKey: ['admin-active-sales-saved-views'],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesSavedViewSearchResponse>(
        adminEndpoints.salesActive.savedViews,
      )
      return response.data
    },
  })
}

function invalidateActiveLeadQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-leads'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-summary'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-lead-detail', userId] })
  void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-follow-ups'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-activities', userId] })
}

export function useUpdateActiveSalesStatus(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesStatusRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.updateStatus(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useUpdateActiveSalesNote(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesNoteRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.updateNote(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useUpdateActiveSalesFollowUp(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateSalesFollowUpRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.updateFollowUp(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useClaimActiveSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.claim(userId),
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useReleaseActiveSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await adminClient.post<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.release(userId),
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useAssignActiveSalesLead(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AssignSalesLeadRequest) => {
      const response = await adminClient.patch<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.assign(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useLogActiveSalesCommunication(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAdminSalesCommunicationRequest) => {
      const response = await adminClient.post<AdminSalesLeadDetailResponse>(
        adminEndpoints.salesActive.communications(userId),
        body,
      )
      return response.data
    },
    onSuccess: () => invalidateActiveLeadQueries(queryClient, userId),
  })
}

export function useCreateActiveSalesSavedView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateAdminSalesSavedViewRequest) => {
      const response = await adminClient.post<AdminSalesSavedViewSummary>(
        adminEndpoints.salesActive.savedViews,
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-saved-views'] })
    },
  })
}

export function useUpdateActiveSalesSavedView(viewId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateAdminSalesSavedViewRequest) => {
      const response = await adminClient.patch<AdminSalesSavedViewSummary>(
        adminEndpoints.salesActive.savedView(viewId),
        body,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-saved-views'] })
    },
  })
}

export function useDeleteActiveSalesSavedView() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (viewId: string) => {
      await adminClient.delete(adminEndpoints.salesActive.savedView(viewId))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-active-sales-saved-views'] })
    },
  })
}
