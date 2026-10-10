import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminMetricCard } from '@/api/types'
import { formatNumber } from '@/utils/format'
import { formatMetricTitle } from '@/utils/metricLabels'

export function MetricBreakdownList({ metric }: { metric: AdminMetricCard }) {
  if (!metric.breakdown.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{`${formatMetricTitle(metric.key)} breakdown`}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {metric.breakdown.map((item) => (
            <li key={`${metric.key}-${item.key}`} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{item.key}</span>
              <span className="font-medium text-slate-900">{formatNumber(item.value)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
