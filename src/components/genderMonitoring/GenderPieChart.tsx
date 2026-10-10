import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { GenderSnapshot } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildGenderPieData } from '@/components/genderMonitoring/genderMonitoringTransforms'

interface GenderPieChartProps {
  title: string
  subtitle: string
  snapshot: GenderSnapshot
}

export function GenderPieChart({ title, subtitle, snapshot }: GenderPieChartProps) {
  const data = buildGenderPieData(snapshot)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" outerRadius={90} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => String(value ?? '0')} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
