import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GenderTrendPoint } from '@/api/types'
import { GENDER_CHART_COLORS } from '@/components/genderMonitoring/genderChartColors'
import { formatRangeLabel, hasTrendData } from '@/components/genderMonitoring/genderMonitoringTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GenderInflowStackedBarProps {
  series: GenderTrendPoint[]
  start: string
  end: string
}

export function GenderInflowStackedBar({ series, start, end }: GenderInflowStackedBarProps) {
  if (!hasTrendData(series)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily new onboarding completions</CardTitle>
        <p className="text-xs text-slate-500">{formatRangeLabel(start, end)}</p>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="male" stackId="gender" fill={GENDER_CHART_COLORS.male} name="Male" isAnimationActive={false} />
            <Bar dataKey="female" stackId="gender" fill={GENDER_CHART_COLORS.female} name="Female" isAnimationActive={false} />
            <Bar
              dataKey="unknown"
              stackId="gender"
              fill={GENDER_CHART_COLORS.unknown}
              name="Unknown"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
