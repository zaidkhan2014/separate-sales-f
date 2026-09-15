import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { LeadUserLabel } from '@/components/common/LeadUserLabel'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminDeletedSalesFollowUps } from '@/hooks/api/useAdminDeletedSales'
import { routes } from '@/router/paths'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20
const buckets = ['due_today', 'overdue', 'upcoming'] as const

export default function DeletedAccountsFollowUpsPage() {
  const [bucket, setBucket] = useState<(typeof buckets)[number]>('due_today')
  const [assignedToMe, setAssignedToMe] = useState(false)
  const [page, setPage] = useState(0)

  const filters = useMemo(
    () => ({
      bucket,
      assignedToMe: assignedToMe || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [assignedToMe, bucket, page],
  )

  const query = useAdminDeletedSalesFollowUps(filters)
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / PAGE_SIZE))

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader title="Deleted Accounts Follow-ups" description="Follow-up queue by UTC day bucket." />

      <div className="flex flex-wrap gap-2">
        {buckets.map((item) => (
          <button
            key={item}
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-sm capitalize',
              bucket === item ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600',
            )}
            onClick={() => {
              setBucket(item)
              setPage(0)
            }}
          >
            {item.replace(/_/g, ' ')}
          </button>
        ))}
        <button
          type="button"
          className={cn(
            'rounded-full border px-3 py-1 text-sm',
            assignedToMe ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600',
          )}
          onClick={() => {
            setAssignedToMe((v) => !v)
            setPage(0)
          }}
        >
          My leads only
        </button>
      </div>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-40 w-full" /> : null}

      {!query.isLoading && !query.data?.items.length ? (
        <EmptyState title="No follow-ups in this bucket." />
      ) : null}

      {query.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Follow-up</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((lead) => (
                  <tr key={lead.userId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <LeadUserLabel userId={lead.userId} label={lead.fullName ?? lead.userId} />
                    </td>
                    <td className="px-3 py-2">{lead.salesStatus}</td>
                    <td className="px-3 py-2">{lead.assignedToAdminId ?? '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.followUpAt)}</td>
                    <td className="px-3 py-2">
                      <Link className="underline" to={routes.deletedAccountsLeadDetail(lead.userId)}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
