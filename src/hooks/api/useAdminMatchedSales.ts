import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type { AdminSalesLeadSearchResponse, MatchedSalesLeadsFilters } from '@/api/types'

export function useAdminMatchedSalesLeads(filters: MatchedSalesLeadsFilters, enabled = true) {
  return useQuery({
    queryKey: ['admin-matched-sales-leads', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminSalesLeadSearchResponse>(
        adminEndpoints.salesMatched.leads,
        { params: cleanQueryParams(filters) },
      )
      return response.data
    },
    enabled,
  })
}
