import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminGenderMonitoringResponse } from '@/api/types'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { CityGenderBarChart } from '@/components/genderMonitoring/CityGenderBarChart'
import { FemalePercentTrendChart } from '@/components/genderMonitoring/FemalePercentTrendChart'
import { GenderInflowStackedBar } from '@/components/genderMonitoring/GenderInflowStackedBar'
import { GenderPieChart } from '@/components/genderMonitoring/GenderPieChart'
import { GenderSnapshotKpiCards } from '@/components/genderMonitoring/GenderSnapshotKpiCards'
import { ProfileStatusGenderBar } from '@/components/genderMonitoring/ProfileStatusGenderBar'
import { Skeleton } from '@/components/ui/skeleton'

interface GenderMonitoringSectionProps {
  query: UseQueryResult<AdminGenderMonitoringResponse, Error>
}

export function GenderMonitoringSection({ query }: GenderMonitoringSectionProps) {
  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`gender-kpi-${index + 1}`} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (query.isError) {
    return <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
  }

  const data = query.data
  if (!data) {
    return null
  }

  return (
    <div className="space-y-4">
      <GenderSnapshotKpiCards snapshot={data.approved.snapshot} />

      <div className="grid gap-4 xl:grid-cols-2">
        <GenderPieChart
          title="Approved pool gender split"
          subtitle="Current approved pool (all-time)"
          snapshot={data.approved.snapshot}
        />
        <GenderPieChart
          title="All onboarded gender split"
          subtitle="Current onboarded pool (all-time)"
          snapshot={data.onboardingComplete.snapshot}
        />
      </div>

      <FemalePercentTrendChart
        approvedSeries={data.approved.cumulativeTrend}
        onboardingSeries={data.onboardingComplete.cumulativeTrend}
        start={data.start}
        end={data.end}
      />

      <GenderInflowStackedBar series={data.approved.inflowTrend} start={data.start} end={data.end} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ProfileStatusGenderBar byProfileStatus={data.onboardingComplete.byProfileStatus} />
        <CityGenderBarChart cityDistribution={data.cityDistribution} start={data.start} end={data.end} />
      </div>
    </div>
  )
}
