import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminMetricCard } from '@/api/types'
import { formatMetricTitle } from '@/utils/metricLabels'

export function MetricSeriesChart({ metric }: { metric: AdminMetricCard }) {
  if (!metric.series.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatMetricTitle(metric.key)}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metric.series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="value"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
