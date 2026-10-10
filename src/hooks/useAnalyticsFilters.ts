import { useState } from 'react'
import type { AnalyticsFilters, GranularityInput } from '@/api/types'
import { defaultDateRange } from '@/utils/date'

export function useAnalyticsFilters(initialGranularity: GranularityInput = 'daily') {
  const defaults = defaultDateRange()
  const [filters, setFilters] = useState<AnalyticsFilters>({
    start: defaults.start,
    end: defaults.end,
    granularity: initialGranularity,
  })
  return {
    filters,
    setFilters,
  }
}
