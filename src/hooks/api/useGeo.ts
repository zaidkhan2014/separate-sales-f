import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type { GeoCity, GeoState } from '@/api/types'

export function useGeoStates(countryIso2: string | null) {
  return useQuery({
    queryKey: ['geo-states', countryIso2],
    queryFn: async () => {
      const response = await adminClient.get<GeoState[]>(adminEndpoints.geo.states, {
        params: cleanQueryParams({ countries: countryIso2 }),
      })
      return response.data
    },
    enabled: Boolean(countryIso2),
    staleTime: 5 * 60_000,
  })
}

export function useGeoCities(stateCode: string | null) {
  return useQuery({
    queryKey: ['geo-cities', stateCode],
    queryFn: async () => {
      const response = await adminClient.get<GeoCity[]>(adminEndpoints.geo.cities, {
        params: cleanQueryParams({ states: stateCode }),
      })
      return response.data
    },
    enabled: Boolean(stateCode),
    staleTime: 5 * 60_000,
  })
}
