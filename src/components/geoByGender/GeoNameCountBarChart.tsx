import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GeoNameCount } from '@/api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GeoNameCountBarChartProps {
  title: string
  subtitle: string
  data: GeoNameCount[]
  barColor: string
  genderTotal: number
}

export function GeoNameCountBarChart({
  title,
  subtitle,
  data,
  barColor,
  genderTotal,
}: GeoNameCountBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent className="h-96">
        {!data.length ? (
          <p className="flex h-full items-center justify-center text-sm text-slate-500">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
              <Tooltip
                formatter={(value) => {
                  const count = typeof value === 'number' ? value : Number(value ?? 0)
                  const share =
                    genderTotal > 0 ? `${((count / genderTotal) * 100).toFixed(1)}% of gender total` : '—'
                  return [`${count.toLocaleString('en-IN')} (${share})`, 'Count']
                }}
              />
              <Bar dataKey="count" fill={barColor} name="Count" isAnimationActive={false}>
                <LabelList dataKey="name" position="insideLeft" fill="#ffffff" fontSize={11} offset={6} />
                <LabelList
                  dataKey="count"
                  position="right"
                  fill="#334155"
                  fontSize={11}
                  formatter={(value) => {
                    const count = typeof value === 'number' ? value : Number(value ?? 0)
                    return count.toLocaleString('en-IN')
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
