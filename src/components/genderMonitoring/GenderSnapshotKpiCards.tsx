import type { GenderSnapshot } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber } from '@/utils/format'

interface GenderSnapshotKpiCardsProps {
  snapshot: GenderSnapshot
}

export function GenderSnapshotKpiCards({ snapshot }: GenderSnapshotKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total approved users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(snapshot.total)}</p>
          <p className="mt-1 text-xs text-slate-500">Current approved pool (all-time)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Female %</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{snapshot.femalePercent.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-slate-500">Current approved pool (all-time)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Male:Female ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{snapshot.maleToFemaleRatio}</p>
          <p className="mt-1 text-xs text-slate-500">Current approved pool (all-time)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Female count</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(snapshot.female)}</p>
          <p className="mt-1 text-xs text-slate-500">Current approved pool (all-time)</p>
        </CardContent>
      </Card>
    </div>
  )
}
