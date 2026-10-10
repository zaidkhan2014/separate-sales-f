import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GenderTrendPoint } from '@/api/types'
import { GENDER_CHART_COLORS } from '@/components/genderMonitoring/genderChartColors'
import { formatRangeLabel, hasTrendData } from '@/components/genderMonitoring/genderMonitoringTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FemalePercentTrendChartProps {
  approvedSeries: GenderTrendPoint[]
  onboardingSeries: GenderTrendPoint[]
  start: string
  end: string
}

export function FemalePercentTrendChart({ approvedSeries, onboardingSeries, start, end }: FemalePercentTrendChartProps) {
  if (!hasTrendData(approvedSeries) && !hasTrendData(onboardingSeries)) {
    return null
  }

  const approvedMap = new Map(approvedSeries.map((point) => [point.bucket, point]))
  const onboardingMap = new Map(onboardingSeries.map((point) => [point.bucket, point]))
  const buckets = Array.from(new Set([...approvedSeries.map((point) => point.bucket), ...onboardingSeries.map((point) => point.bucket)]))
  const data = buckets.map((bucket) => ({
    bucket,
    approvedFemalePercent: approvedMap.get(bucket)?.femalePercent ?? null,
    onboardingFemalePercent: onboardingMap.get(bucket)?.femalePercent ?? null,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Female % trend</CardTitle>
        <p className="text-xs text-slate-500">{formatRangeLabel(start, end)}</p>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="approvedFemalePercent"
              name="Approved pool"
              stroke={GENDER_CHART_COLORS.female}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="onboardingFemalePercent"
              name="All onboarded"
              stroke={GENDER_CHART_COLORS.male}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
