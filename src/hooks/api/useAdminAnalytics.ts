import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminGenderMonitoringResponse,
  AdminGeoByGenderResponse,
  AdminMetricsResponse,
  AdminOnboardingDropoffWithMediaResponse,
  AnalyticsFilters,
  GenderMonitoringFilters,
  OnboardingDropoffFilters,
} from '@/api/types'

export function useDemographicsMetrics(filters: Omit<AnalyticsFilters, 'granularity'>) {
  return useQuery({
    queryKey: ['analytics', 'demographics', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminMetricsResponse>(adminEndpoints.analytics.demographics, {
        params: cleanQueryParams(filters),
      })
      return response.data
    },
  })
}

export function useGenderMonitoringMetrics(filters: GenderMonitoringFilters) {
  return useQuery({
    queryKey: ['analytics', 'gender-monitoring', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminGenderMonitoringResponse>(
        adminEndpoints.analytics.genderMonitoring,
        {
          params: cleanQueryParams({
            start: filters.start,
            end: filters.end,
            granularity: filters.granularity,
            cityLimit: filters.cityLimit,
          }),
        },
      )
      return response.data
    },
  })
}

export function useGeoByGenderMetrics(limit = 20) {
  return useQuery({
    queryKey: ['analytics', 'geo-by-gender', limit],
    queryFn: async () => {
      const response = await adminClient.get<AdminGeoByGenderResponse>(adminEndpoints.analytics.geoByGender, {
        params: cleanQueryParams({ limit }),
      })
      return response.data
    },
  })
}

/** Gated: only fetches when filters.day is set (user clicked Check). */
export function useAdminOnboardingDropoff(filters: OnboardingDropoffFilters | null) {
  return useQuery({
    queryKey: ['admin-onboarding-dropoff', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminOnboardingDropoffWithMediaResponse>(
        adminEndpoints.analytics.onboardingDropoffWithMedia,
        {
          params: cleanQueryParams(filters ?? {}),
          // Rekognition-backed day Check can take several minutes on busy days.
          timeout: 10 * 60 * 1000,
        },
      )
      return response.data
    },
    enabled: Boolean(filters?.day),
    staleTime: 30_000,
  })
}
