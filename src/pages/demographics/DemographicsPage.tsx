import { PageHeader } from '@/components/common/PageHeader'
import { GenderMonitoringSection } from '@/components/genderMonitoring/GenderMonitoringSection'
import { GeoByGenderSection } from '@/components/geoByGender/GeoByGenderSection'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { MetricsSection } from '@/components/metrics/MetricsSection'
import {
  useDemographicsMetrics,
  useGenderMonitoringMetrics,
  useGeoByGenderMetrics,
} from '@/hooks/api/useAdminAnalytics'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'

export default function DemographicsPage() {
  const { filters, setFilters } = useAnalyticsFilters('daily')
  const genderMonitoringQuery = useGenderMonitoringMetrics(filters)
  const geoByGenderQuery = useGeoByGenderMetrics(20)
  const demographicsQuery = useDemographicsMetrics({
    start: filters.start,
    end: filters.end,
  })

  return (
    <section className="space-y-4">
      <PageHeader
        title="Demographics"
        description="Gender ratio and city intake monitoring with trend charts for onboarding-complete cohorts."
      />
      <DateGranularityControls
        start={filters.start}
        end={filters.end}
        granularity={filters.granularity}
        onChange={setFilters}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Gender monitoring</h2>
        <p className="text-sm text-slate-600">
          Snapshot cards are all-time current pool values. Trend and city charts follow the selected range.
        </p>
        <GenderMonitoringSection query={genderMonitoringQuery} />
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Geo by gender</h2>
        <p className="text-sm text-slate-600">
          All-time top cities and states ranked separately for Female and Male. Not affected by the date range
          above.
        </p>
        <GeoByGenderSection query={geoByGenderQuery} />
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">Legacy demographics</h2>
        <p className="text-sm text-slate-600">Country and category breakdowns from the existing demographics endpoint.</p>
        <MetricsSection query={demographicsQuery} />
      </div>
    </section>
  )
}
