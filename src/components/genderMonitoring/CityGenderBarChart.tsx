import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CityDistributionStats } from '@/api/types'
import { GENDER_CHART_COLORS } from '@/components/genderMonitoring/genderChartColors'
import { formatRangeLabel, hasCityData } from '@/components/genderMonitoring/genderMonitoringTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CityGenderBarChartProps {
  cityDistribution: CityDistributionStats
  start: string
  end: string
}

export function CityGenderBarChart({ cityDistribution, start, end }: CityGenderBarChartProps) {
  if (!hasCityData(cityDistribution)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approved signups by city</CardTitle>
        <p className="text-xs text-slate-500">{formatRangeLabel(start, end)}</p>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cityDistribution.cities} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={100} />
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
