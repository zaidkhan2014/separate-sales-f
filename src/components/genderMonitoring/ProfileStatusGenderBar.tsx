import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GenderSnapshot } from '@/api/types'
import { GENDER_CHART_COLORS } from '@/components/genderMonitoring/genderChartColors'
import { buildProfileStatusRows } from '@/components/genderMonitoring/genderMonitoringTransforms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileStatusGenderBarProps {
  byProfileStatus: Record<string, GenderSnapshot>
}

export function ProfileStatusGenderBar({ byProfileStatus }: ProfileStatusGenderBarProps) {
  const data = buildProfileStatusRows(byProfileStatus)
  if (!data.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status breakdown by gender</CardTitle>
        <p className="text-xs text-slate-500">All-time current breakdown</p>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={80} />
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
