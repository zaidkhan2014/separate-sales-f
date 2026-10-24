import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { LeadUserLabel } from '@/components/common/LeadUserLabel'
import { BioCell } from '@/components/sales/BioCell'
import { LeadPhotoThumb } from '@/components/sales/LeadPhotoThumb'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminMatchedSalesLeads } from '@/hooks/api/useAdminMatchedSales'
import { cn } from '@/lib/cn'
import {
  matchedRangePreset,
  matchedUsersListStateToApiFilters,
  matchedUsersRangeError,
  parseMatchedUsersListSearchParams,
  toMatchedUsersListSearchParams,
  type MatchedUsersListUrlState,
} from '@/pages/matched-users/matchedUsersListSearchParams'
import { routes } from '@/router/paths'
import { formatDate, formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20

export default function MatchedUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsed = useMemo(() => parseMatchedUsersListSearchParams(searchParams), [searchParams])

  const setFilters = useCallback(
    (patch: Partial<MatchedUsersListUrlState>) => {
      const next = { ...parsed, ...patch }
      setSearchParams(toMatchedUsersListSearchParams(next), { replace: true })
    },
    [parsed, setSearchParams],
  )

  const rangeError = matchedUsersRangeError(parsed.start, parsed.end)
  const queryEnabled = !rangeError
  const filters = useMemo(
    () => matchedUsersListStateToApiFilters(parsed, PAGE_SIZE),
    [parsed],
  )

  const leadsQuery = useAdminMatchedSalesLeads(filters, queryEnabled)

  const totalPages = useMemo(() => {
    const total = leadsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [leadsQuery.data?.total])

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader
        title="Matched Users"
        description="Distinct users who participated in at least one match in the selected window (matches.matchedAt)."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { days: 1 as const, label: 'Today' },
            { days: 7 as const, label: 'Last 7d' },
            { days: 30 as const, label: 'Last 30d' },
          ] as const
        ).map((preset) => (
          <button
            key={preset.days}
            type="button"
            className={cn(
              'rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100',
            )}
            onClick={() => {
              const range = matchedRangePreset(preset.days)
              setFilters({ ...range, page: 0 })
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="grid gap-3 p-3 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium text-slate-800">Matched from</span>
            <Input
              type="datetime-local"
              value={parsed.start}
              onChange={(event) => setFilters({ start: event.target.value, page: 0 })}
              aria-label="Matched from"
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium text-slate-800">Matched to</span>
            <Input
              type="datetime-local"
              value={parsed.end}
              onChange={(event) => setFilters({ end: event.target.value, page: 0 })}
              aria-label="Matched to"
            />
          </label>
        </CardContent>
      </Card>

      {rangeError ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">{rangeError}</Alert>
      ) : null}

      {queryEnabled ? (
        <QueryFeedback loading={false} error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
      ) : null}

      {queryEnabled && leadsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`matched-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {queryEnabled && !leadsQuery.isLoading && !leadsQuery.data?.items.length ? (
        <EmptyState title="No matched users found." subtitle="Try a different date range." />
      ) : null}

      {queryEnabled && leadsQuery.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Photo</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Education</th>
                  <th className="px-3 py-2">Profession</th>
                  <th className="px-3 py-2">Bio</th>
                  <th className="px-3 py-2">Account status</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Income</th>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">DOB</th>
                  <th className="px-3 py-2">Marital</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Follow-up</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsQuery.data.items.map((lead) => (
                  <tr key={lead.userId} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2">
                      <LeadUserLabel userId={lead.userId} label={lead.fullName ?? lead.userId} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{lead.phone ?? '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(lead.createdAt)}</td>
                    <td className="px-3 py-2">{lead.state ?? '—'}</td>
                    <td className="px-3 py-2">{lead.city ?? '—'}</td>
                    <td className="px-3 py-2">
                      <LeadPhotoThumb
                        url={lead.primaryImageUrl}
                        alt={`${lead.fullName ?? lead.userId} photo`}
                      />
                    </td>
                    <td className="px-3 py-2">{lead.salesStatus}</td>
                    <td className="px-3 py-2">{lead.education ?? '--'}</td>
                    <td className="px-3 py-2">{lead.profession ?? '--'}</td>
                    <td className="max-w-[220px] px-3 py-2">
                      <BioCell bio={lead.bio} />
                    </td>
                    <td className="px-3 py-2">{lead.accountStatus ?? '—'}</td>
                    <td className="px-3 py-2">{lead.assignedToAdminId ?? '--'}</td>
                    <td className="px-3 py-2">{lead.leadScore ?? '--'}</td>
                    <td className="px-3 py-2">{lead.incomeLabel ?? '--'}</td>
                    <td className="px-3 py-2">{lead.age ?? '--'}</td>
                    <td className="px-3 py-2">{formatDate(lead.dateOfBirth)}</td>
                    <td className="px-3 py-2">{lead.maritalStatus ?? '--'}</td>
                    <td className="px-3 py-2">{lead.outcomeReason ?? '--'}</td>
                    <td className="max-w-[200px] px-3 py-2">{lead.note || '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.followUpAt)}</td>
                    <td className="px-3 py-2">
                      <Link className="underline" to={routes.leadDetail(lead.userId)}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {queryEnabled ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {parsed.page + 1} of {totalPages}
            {leadsQuery.data?.total != null ? ` · ${leadsQuery.data.total} total` : ''}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
              disabled={parsed.page === 0}
              onClick={() => setFilters({ page: Math.max(0, parsed.page - 1) })}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
              disabled={parsed.page + 1 >= totalPages}
              onClick={() => setFilters({ page: parsed.page + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
