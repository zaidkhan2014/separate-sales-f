import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminMetricsResponse, AnalyticsFilters } from '@/api/types'
import { PageHeader } from '@/components/common/PageHeader'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'

export interface AnalyticsExtraMetricsBlock {
  title: string
  description?: string
  query: UseQueryResult<AdminMetricsResponse, Error>
}

interface AnalyticsPageTemplateProps {
  title: string
  description: string
  /** Optional semantics or notes shown under the page description (e.g. OTP field definitions). */
  details?: ReactNode
  filters: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  query: UseQueryResult<AdminMetricsResponse, Error>
  showGranularity?: boolean
  /** Optional extra metric sections (e.g. search-index on Overview). */
  extraQueries?: AnalyticsExtraMetricsBlock[]
}

export function AnalyticsPageTemplate({
  title,
  description,
  details,
  filters,
  onFiltersChange,
  query,
  showGranularity = true,
  extraQueries,
}: AnalyticsPageTemplateProps) {
  return (
    <section className="space-y-4">
      <PageHeader title={title} description={description} />
      {details ? <div className="text-sm text-slate-600 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">{details}</div> : null}
      <DateGranularityControls
        start={filters.start}
        end={filters.end}
        granularity={filters.granularity}
        onChange={onFiltersChange}
        showGranularity={showGranularity}
      />
      <MetricsSection query={query} />
      {extraQueries?.map((block, index) => (
        <div key={`${block.title}-${index}`} className="space-y-3 border-t border-slate-200 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{block.title}</h2>
            {block.description ? <p className="text-sm text-slate-600">{block.description}</p> : null}
          </div>
          <MetricsSection query={block.query} />
        </div>
      ))}
    </section>
  )
}
