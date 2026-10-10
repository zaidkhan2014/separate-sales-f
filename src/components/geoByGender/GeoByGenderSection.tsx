import type { UseQueryResult } from '@tanstack/react-query'
import type { AdminGeoByGenderResponse } from '@/api/types'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { GeoByGenderKpiCards } from '@/components/geoByGender/GeoByGenderKpiCards'
import { GeoNameCountBarChart } from '@/components/geoByGender/GeoNameCountBarChart'
import { GENDER_CHART_COLORS } from '@/components/genderMonitoring/genderChartColors'
import { Skeleton } from '@/components/ui/skeleton'

const ALL_TIME_SUBTITLE = 'Approved + onboarded (includes deleted accounts) · all-time'

interface GeoByGenderSectionProps {
  query: UseQueryResult<AdminGeoByGenderResponse, Error>
}

export function GeoByGenderSection({ query }: GeoByGenderSectionProps) {
  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
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
      <GeoByGenderKpiCards femaleTotal={data.femaleTotal} maleTotal={data.maleTotal} />

      <div className="grid gap-4 xl:grid-cols-2">
        <GeoNameCountBarChart
          title="Top cities — Female"
          subtitle={ALL_TIME_SUBTITLE}
          data={data.cities.female}
          barColor={GENDER_CHART_COLORS.female}
          genderTotal={data.femaleTotal}
        />
        <GeoNameCountBarChart
          title="Top cities — Male"
          subtitle={ALL_TIME_SUBTITLE}
          data={data.cities.male}
          barColor={GENDER_CHART_COLORS.male}
          genderTotal={data.maleTotal}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GeoNameCountBarChart
          title="Top states — Female"
          subtitle={ALL_TIME_SUBTITLE}
          data={data.states.female}
          barColor={GENDER_CHART_COLORS.female}
          genderTotal={data.femaleTotal}
        />
        <GeoNameCountBarChart
          title="Top states — Male"
          subtitle={ALL_TIME_SUBTITLE}
          data={data.states.male}
          barColor={GENDER_CHART_COLORS.male}
          genderTotal={data.maleTotal}
        />
      </div>
    </div>
  )
}
