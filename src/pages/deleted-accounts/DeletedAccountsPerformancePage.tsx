import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminDeletedSalesAgentPerformance } from '@/hooks/api/useAdminDeletedSales'
import { toUtcIso } from '@/utils/date'
import { formatNumber } from '@/utils/format'

export default function DeletedAccountsPerformancePage() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  const filters = useMemo(
    () => ({
      start: toUtcIso(start),
      end: toUtcIso(end),
      employeeId: employeeId.trim() || undefined,
    }),
    [employeeId, end, start],
  )

  const query = useAdminDeletedSalesAgentPerformance(filters)

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader
        title="Deleted Accounts Agent Performance"
        description="Sales staff metrics for deleted accounts in the selected period."
      />

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block font-medium">Updated from</span>
          <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block font-medium">Updated to</span>
          <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block font-medium">Employee ID (managers)</span>
          <Input placeholder="SALES001" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
        </label>
      </div>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-40 w-full" /> : null}

      {!query.isLoading && !query.data?.items.length ? <EmptyState title="No performance data." /> : null}

      {query.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Claimed</th>
                  <th className="px-3 py-2">Calls</th>
                  <th className="px-3 py-2">Interested</th>
                  <th className="px-3 py-2">Converted</th>
                  <th className="px-3 py-2">Overdue F/U</th>
                  <th className="px-3 py-2">Avg min to 1st call</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((row) => (
                  <tr key={row.employeeId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.employeeId}</div>
                    </td>
                    <td className="px-3 py-2">{formatNumber(row.claimedCount)}</td>
                    <td className="px-3 py-2">{formatNumber(row.callsCount)}</td>
                    <td className="px-3 py-2">{formatNumber(row.interestedCount)}</td>
                    <td className="px-3 py-2">{formatNumber(row.convertedCount)}</td>
                    <td className="px-3 py-2">{formatNumber(row.overdueFollowUps)}</td>
                    <td className="px-3 py-2">
                      {row.avgMinutesToFirstCall != null ? formatNumber(row.avgMinutesToFirstCall) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
