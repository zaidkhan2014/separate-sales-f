import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactNumber } from '@/utils/format'

const ALL_TIME_SUBTITLE = 'Approved + onboarded (includes deleted accounts) · all-time'

interface GeoByGenderKpiCardsProps {
  femaleTotal: number
  maleTotal: number
}

export function GeoByGenderKpiCards({ femaleTotal, maleTotal }: GeoByGenderKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Female total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(femaleTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">{ALL_TIME_SUBTITLE}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Male total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(maleTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">{ALL_TIME_SUBTITLE}</p>
        </CardContent>
      </Card>
    </div>
  )
}
