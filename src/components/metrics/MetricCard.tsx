import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminMetricCard } from '@/api/types'
import { formatCompactNumber } from '@/utils/format'
import { formatMetricTitle } from '@/utils/metricLabels'

export function MetricCard({ metric }: { metric: AdminMetricCard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatMetricTitle(metric.key)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(metric.total)}</p>
      </CardContent>
    </Card>
  )
}
