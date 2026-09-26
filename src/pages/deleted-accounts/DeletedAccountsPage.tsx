import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { LeadUserLabel } from '@/components/common/LeadUserLabel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { GeoLocationFilters } from '@/components/geo/GeoLocationFilters'
import { useAdminDeletedSalesLeads, useAdminDeletedSalesSummary } from '@/hooks/api/useAdminDeletedSales'
import type { AdminSalesStatus } from '@/api/types'
import { cn } from '@/lib/cn'
import { DeletedAccountsSavedViews } from '@/pages/deleted-accounts/DeletedAccountsSavedViews'
import {
  ADMIN_SALES_STATUS_FILTER_OPTIONS,
  PROFILE_CREATED_FOR_FILTER_OPTIONS,
  SALES_MARITAL_STATUS_OPTIONS,
  birthYearForLeadsApi,
  salesSummaryMetricLabel,
} from '@/pages/sales/salesConstants'
import {
  INDIA_MIN_INCOME_BANDS,
  INTL_MIN_INCOME_BANDS,
} from '@/pages/sales/salesIncomeBands'
import {
  DELETED_ACCOUNTS_LIST_SEARCH_STORAGE_KEY,
  activeDeletedAccountsListPreset,
  deletionRangePreset,
  parseDeletedAccountsListSearchParams,
  deletedAccountsListPresetPatch,
  deletedAccountsListStateToApiFilters,
  toDeletedAccountsListSearchParams,
  type DeletedAccountsListUrlState,
} from '@/pages/deleted-accounts/deletedAccountsListSearchParams'
import { routes } from '@/router/paths'
import { formatCompactNumber, formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20

export default function DeletedAccountsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const parsed = useMemo(() => parseDeletedAccountsListSearchParams(searchParams), [searchParams])
  const didHydrateFromStorageRef = useRef(false)
  const viewPreset = activeDeletedAccountsListPreset(parsed)

  const setFilters = useCallback(
    (patch: Partial<DeletedAccountsListUrlState>) => {
      const next = { ...parsed, ...patch }
      setSearchParams(toDeletedAccountsListSearchParams(next), { replace: true })
    },
    [parsed, setSearchParams],
  )

  useEffect(() => {
    if (location.pathname !== routes.deletedAccounts) return

    const spStr = searchParams.toString()

    if (!spStr && !didHydrateFromStorageRef.current) {
      let stored: string | null = null
      try {
        stored = sessionStorage.getItem(DELETED_ACCOUNTS_LIST_SEARCH_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      if (stored) {
        didHydrateFromStorageRef.current = true
        navigate({ pathname: routes.deletedAccounts, search: stored }, { replace: true })
        return
      }
    }

    try {
      sessionStorage.setItem(DELETED_ACCOUNTS_LIST_SEARCH_STORAGE_KEY, spStr)
    } catch {
      /* ignore quota / private mode */
    }
  }, [location.pathname, navigate, searchParams])

  const filters = useMemo(() => deletedAccountsListStateToApiFilters(parsed, PAGE_SIZE), [parsed])

  const leadsQuery = useAdminDeletedSalesLeads(filters)
  const summaryQuery = useAdminDeletedSalesSummary({ start: filters.start, end: filters.end })

  const totalPages = useMemo(() => {
    const total = leadsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [leadsQuery.data?.total])

  const filteredTotalIsPageBound =
    parsed.status !== 'ALL' || Boolean(filters.followUpStart) || Boolean(filters.followUpEnd)

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader title="Deleted Accounts" description="Purged account archives with sales CRM history." />

      <div className="flex flex-wrap gap-2">
        {(['all', 'pool', 'my_leads'] as const).map((preset) => (
          <button
            key={preset}
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition',
              viewPreset === preset
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
            )}
            onClick={() => setFilters(deletedAccountsListPresetPatch(preset))}
          >
            {preset === 'all' ? 'All leads' : preset === 'pool' ? 'Pool' : 'My leads'}
          </button>
        ))}
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            Use <strong>Pool</strong> for unclaimed leads and <strong>My leads</strong> for your assigned queue. Sales
            agents should use these presets — the API does not auto-scope lists by role.
          </p>
        </CardHeader>
        <CardContent className="min-w-0 space-y-6 overflow-x-auto pt-0">
          <DeletedAccountsSavedViews
            currentSearch={location.search}
            onLoadView={(search) => navigate({ pathname: routes.deletedAccounts, search }, { replace: true })}
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900">Deleted</h4>
              <div className="flex flex-wrap gap-2">
                {([7, 30, 90] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => setFilters({ ...deletionRangePreset(days), page: 0 })}
                  >
                    Last {days}d
                  </button>
                ))}
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">From</span>
                <Input
                  id="deleted-filter-deletion-start"
                  type="datetime-local"
                  value={parsed.start}
                  onChange={(event) => setFilters({ start: event.target.value, page: 0 })}
                  aria-label="Deleted from"
                />
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">To</span>
                <Input
                  id="deleted-filter-deletion-end"
                  type="datetime-local"
                  value={parsed.end}
                  onChange={(event) => setFilters({ end: event.target.value, page: 0 })}
                  aria-label="Deleted to"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500">Filters by deletion time (softDeletedAt, else purgedAt).</p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Follow-up scheduled</h4>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">From</span>
                <Input
                  id="deleted-filter-followup-start"
                  type="datetime-local"
                  value={parsed.followUpStart}
                  onChange={(event) => setFilters({ followUpStart: event.target.value, page: 0 })}
                  aria-label="Follow-up from"
                />
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">To</span>
                <Input
                  id="deleted-filter-followup-end"
                  type="datetime-local"
                  value={parsed.followUpEnd}
                  onChange={(event) => setFilters({ followUpEnd: event.target.value, page: 0 })}
                  aria-label="Follow-up to"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Profile filters</h4>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Profile status</span>
                <Select
                  id="deleted-filter-profile-status"
                  value={parsed.profileStatus}
                  onChange={(event) => {
                    setFilters({
                      profileStatus: event.target.value as DeletedAccountsListUrlState['profileStatus'],
                      page: 0,
                    })
                  }}
                  aria-label="Filter by profile moderation status"
                >
                  <option value="APPROVED">Approved (default)</option>
                  <option value="ANY">Any</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </Select>
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Gender (exact match)</span>
                <Input
                  id="deleted-filter-gender"
                  placeholder="e.g. Male"
                  value={parsed.gender}
                  onChange={(event) => setFilters({ gender: event.target.value, page: 0 })}
                  aria-label="Filter by gender exact match"
                />
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Born on or before (year)</span>
                <Input
                  id="deleted-filter-birth-year"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="e.g. 2000"
                  value={parsed.birthYear}
                  onChange={(event) => setFilters({ birthYear: event.target.value, page: 0 })}
                  aria-label="Filter by maximum birth year"
                />
                {parsed.birthYear.trim() !== '' && birthYearForLeadsApi(parsed.birthYear) === undefined ? (
                  <span className="mt-1 block text-xs text-amber-800">
                    Enter a whole year between 1900 and 2100 (digits only).
                  </span>
                ) : parsed.birthYear.trim() !== '' ? (
                  <span className="mt-1 block text-xs text-slate-500">
                    Profiles born in this year or earlier (DOB ≤ YYYY-12-31).
                  </span>
                ) : null}
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Marital status</span>
                <Select
                  id="deleted-filter-marital-status"
                  value={parsed.maritalStatus}
                  onChange={(event) => setFilters({ maritalStatus: event.target.value, page: 0 })}
                  aria-label="Filter by marital status"
                >
                  <option value="">Any</option>
                  {SALES_MARITAL_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Created for</span>
                <Select
                  id="deleted-filter-profile-created-for"
                  value={parsed.profileCreatedFor}
                  onChange={(event) => setFilters({ profileCreatedFor: event.target.value, page: 0 })}
                  aria-label="Filter by profile created for"
                >
                  <option value="">Any</option>
                  {PROFILE_CREATED_FOR_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <GeoLocationFilters
                idPrefix="deleted-filter"
                value={{
                  country: parsed.country,
                  countryIso: parsed.countryIso,
                  state: parsed.state,
                  city: parsed.city,
                }}
                onChange={(patch) => setFilters({ ...patch, page: 0 })}
              />
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Minimum income</span>
                <Select
                  id="deleted-filter-min-income"
                  value={parsed.minIncomeBandId}
                  onChange={(event) => setFilters({ minIncomeBandId: event.target.value, page: 0 })}
                  aria-label="Filter by minimum income band"
                >
                  <option value="">Any</option>
                  <optgroup label="India">
                    {INDIA_MIN_INCOME_BANDS.map((band) => (
                      <option key={band.id} value={band.id}>
                        {band.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="International">
                    {INTL_MIN_INCOME_BANDS.map((band) => (
                      <option key={band.id} value={band.id}>
                        {band.label}
                      </option>
                    ))}
                  </optgroup>
                </Select>
                <span className="mt-1 block text-xs text-slate-500">
                  Profiles at or above this band; profiles without income are hidden.
                </span>
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Subscribed</span>
                <Select
                  id="deleted-filter-subscribed"
                  value={parsed.subscribedTri}
                  onChange={(event) => {
                    setFilters({
                      subscribedTri: event.target.value as DeletedAccountsListUrlState['subscribedTri'],
                      page: 0,
                    })
                  }}
                  aria-label="Filter by subscribed"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">Verified profile</span>
                <Select
                  id="deleted-filter-verified"
                  value={parsed.verifiedTri}
                  onChange={(event) => {
                    setFilters({
                      verifiedTri: event.target.value as DeletedAccountsListUrlState['verifiedTri'],
                      page: 0,
                    })
                  }}
                  aria-label="Filter by verified profile"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </label>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Sales status</span>
              <Select
                id="deleted-filter-status"
                value={parsed.status}
                onChange={(event) => {
                  setFilters({
                    status: event.target.value as 'ALL' | AdminSalesStatus,
                    page: 0,
                  })
                }}
                aria-label="Filter by sales status"
              >
                {ADMIN_SALES_STATUS_FILTER_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Search</span>
              <Input
                id="deleted-filter-search"
                placeholder="User ID, member ID, phone, or name"
                value={parsed.query}
                onChange={(event) => setFilters({ query: event.target.value, page: 0 })}
                aria-label="Search leads"
              />
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Sort</span>
              <Select
                id="deleted-filter-sort"
                value={parsed.sort}
                onChange={(event) => {
                  setFilters({
                    sort: event.target.value as DeletedAccountsListUrlState['sort'],
                    page: 0,
                  })
                }}
                aria-label="Sort leads"
              >
                <option value="">Default</option>
                <option value="leadScore">Lead score</option>
              </Select>
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Assigned to (employeeId)</span>
              <Input
                id="deleted-filter-assigned"
                placeholder="SALES001 or UNASSIGNED"
                value={parsed.assignedToAdminId}
                onChange={(event) => setFilters({ assignedToAdminId: event.target.value, page: 0 })}
                aria-label="Filter by assignee"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <QueryFeedback loading={false} error={summaryQuery.error} onRetry={() => void summaryQuery.refetch()} />
      {summaryQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`sales-summary-${index + 1}`} className="h-28 w-full" />
          ))}
        </div>
      ) : null}
      {summaryQuery.data?.metrics?.length ? (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {summaryQuery.data.metrics.map((metric) => (
            <Card key={metric.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-slate-500">
                  {salesSummaryMetricLabel(metric.key)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-slate-900">{formatCompactNumber(metric.total)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <QueryFeedback loading={false} error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
      {leadsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`lead-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {!leadsQuery.isLoading && !leadsQuery.data?.items.length ? (
        <EmptyState title="No leads found." subtitle="Try adjusting filters or switch Pool / My leads." />
      ) : null}

      {leadsQuery.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Income</th>
                  <th className="px-3 py-2">Deleted</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Follow-up</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsQuery.data.items.map((lead) => (
                  <tr key={lead.userId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <LeadUserLabel userId={lead.userId} label={lead.fullName ?? lead.userId} />
                    </td>
                    <td className="px-3 py-2">{lead.salesStatus}</td>
                    <td className="px-3 py-2">{lead.assignedToAdminId ?? '--'}</td>
                    <td className="px-3 py-2">{lead.leadScore ?? '--'}</td>
                    <td className="px-3 py-2">{lead.incomeLabel ?? '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.deletionAt)}</td>
                    <td className="px-3 py-2">{lead.outcomeReason ?? '--'}</td>
                    <td className="max-w-[200px] px-3 py-2">{lead.note || '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.followUpAt)}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="underline"
                        to={routes.deletedAccountsLeadDetail(lead.userId)}
                        state={{ deletedAccountsListSearch: location.search }}
                      >
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          <p>
            Page {parsed.page + 1} of {totalPages}
          </p>
          {filteredTotalIsPageBound ? (
            <p className="text-xs">
              Filtered totals are page-scoped by backend when status or follow-up filters are applied.
            </p>
          ) : null}
        </div>
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
    </section>
  )
}
