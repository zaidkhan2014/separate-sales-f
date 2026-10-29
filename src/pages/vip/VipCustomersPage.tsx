import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { VipLeadLink } from '@/components/common/VipLeadLink'
import { LeadPhotoThumb } from '@/components/sales/LeadPhotoThumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminSalesStatus, VipLeadSort } from '@/api/types'
import { useAdminVipLeads } from '@/hooks/api/useAdminVip'
import { cn } from '@/lib/cn'
import { ADMIN_SALES_STATUS_FILTER_OPTIONS } from '@/pages/sales/salesConstants'
import { SALES_CASTE_LABELS, SALES_SECT_LABELS } from '@/pages/sales/salesSectCaste'
import {
  VIP_LIST_SEARCH_STORAGE_KEY,
  activeVipListPreset,
  parseVipListSearchParams,
  toVipListSearchParams,
  vipListPresetPatch,
  vipListStateToApiFilters,
  vipRequestedRangePreset,
  type VipListUrlState,
} from '@/pages/vip/vipListSearchParams'
import { routes } from '@/router/paths'
import { formatDate, formatDateTime, formatNumber } from '@/utils/format'

const PAGE_SIZE = 20

function formatInr(value: number | null | undefined): string {
  if (value == null) return '--'
  return `₹${formatNumber(value)}`
}

export default function VipCustomersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const parsed = useMemo(() => parseVipListSearchParams(searchParams), [searchParams])
  const didHydrateFromStorageRef = useRef(false)
  const viewPreset = activeVipListPreset(parsed)

  const setFilters = useCallback(
    (patch: Partial<VipListUrlState>) => {
      const next = { ...parsed, ...patch }
      setSearchParams(toVipListSearchParams(next), { replace: true })
    },
    [parsed, setSearchParams],
  )

  useEffect(() => {
    if (location.pathname !== routes.vip) return

    const spStr = searchParams.toString()

    if (!spStr && !didHydrateFromStorageRef.current) {
      let stored: string | null = null
      try {
        stored = sessionStorage.getItem(VIP_LIST_SEARCH_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      if (stored) {
        didHydrateFromStorageRef.current = true
        navigate({ pathname: routes.vip, search: stored }, { replace: true })
        return
      }
    }

    try {
      sessionStorage.setItem(VIP_LIST_SEARCH_STORAGE_KEY, spStr)
    } catch {
      /* ignore quota / private mode */
    }
  }, [location.pathname, navigate, searchParams])

  const filters = useMemo(() => vipListStateToApiFilters(parsed, PAGE_SIZE), [parsed])
  const leadsQuery = useAdminVipLeads(filters)

  const totalPages = useMemo(() => {
    const total = leadsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [leadsQuery.data?.total])

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader
        title="VIP Customers"
        description="VIP consultation leads from mobile CTA — claim and close high-value deals first."
      />

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
            onClick={() => setFilters(vipListPresetPatch(preset))}
          >
            {preset === 'all' ? 'All leads' : preset === 'pool' ? 'Pool' : 'My leads'}
          </button>
        ))}
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            Use <strong>Pool</strong> for unclaimed leads and <strong>My leads</strong> for your assigned queue.
          </p>
        </CardHeader>
        <CardContent className="min-w-0 space-y-6 overflow-x-auto pt-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900">Last requested</h4>
              <div className="flex flex-wrap gap-2">
                {([7, 30, 90] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => setFilters({ ...vipRequestedRangePreset(days), page: 0 })}
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
                  id="vip-filter-requested-start"
                  type="datetime-local"
                  value={parsed.start}
                  onChange={(event) => setFilters({ start: event.target.value, page: 0 })}
                  aria-label="Last requested from"
                />
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">To</span>
                <Input
                  id="vip-filter-requested-end"
                  type="datetime-local"
                  value={parsed.end}
                  onChange={(event) => setFilters({ end: event.target.value, page: 0 })}
                  aria-label="Last requested to"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500">Filters by lastRequestedAt (end exclusive on server).</p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Follow-up scheduled</h4>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">From</span>
                <Input
                  id="vip-filter-followup-start"
                  type="datetime-local"
                  value={parsed.followUpStart}
                  onChange={(event) => setFilters({ followUpStart: event.target.value, page: 0 })}
                  aria-label="Follow-up from"
                />
              </label>
              <label className="block min-w-0 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">To</span>
                <Input
                  id="vip-filter-followup-end"
                  type="datetime-local"
                  value={parsed.followUpEnd}
                  onChange={(event) => setFilters({ followUpEnd: event.target.value, page: 0 })}
                  aria-label="Follow-up to"
                />
              </label>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Status</span>
              <Select
                id="vip-filter-status"
                value={parsed.status}
                onChange={(event) => {
                  setFilters({
                    status: event.target.value as 'ALL' | AdminSalesStatus,
                    page: 0,
                  })
                }}
                aria-label="Filter by VIP status"
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
                id="vip-filter-search"
                placeholder="User ID, VIP title, member ID, phone, or name"
                value={parsed.query}
                onChange={(event) => setFilters({ query: event.target.value, page: 0 })}
                aria-label="Search VIP leads"
              />
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Sect</span>
              <Select
                id="vip-filter-sect"
                value={parsed.sect}
                onChange={(event) => setFilters({ sect: event.target.value, page: 0 })}
                aria-label="Filter by sect"
              >
                <option value="">Any</option>
                {SALES_SECT_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Caste</span>
              <SearchableSelect
                id="vip-filter-caste"
                aria-label="Filter by caste"
                options={SALES_CASTE_LABELS.map((label) => ({ value: label, label }))}
                value={parsed.caste}
                placeholder="Search caste…"
                emptyLabel="Any"
                onChange={(caste) => setFilters({ caste, page: 0 })}
              />
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Sort</span>
              <Select
                id="vip-filter-sort"
                value={parsed.sort}
                onChange={(event) => {
                  setFilters({
                    sort: event.target.value as '' | VipLeadSort,
                    page: 0,
                  })
                }}
                aria-label="Sort VIP leads"
              >
                <option value="">Newest (default)</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="follow_up">Follow-up</option>
                <option value="updated">Updated</option>
              </Select>
            </label>
            <label className="block min-w-0 text-sm text-slate-600">
              <span className="mb-1 block font-medium text-slate-800">Assigned to (employeeId)</span>
              <Input
                id="vip-filter-assigned"
                placeholder="SALES001"
                value={parsed.assignedToAdminId}
                onChange={(event) => setFilters({ assignedToAdminId: event.target.value, page: 0 })}
                aria-label="Filter by assignee"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <QueryFeedback loading={false} error={leadsQuery.error} onRetry={() => void leadsQuery.refetch()} />
      {leadsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`vip-lead-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {!leadsQuery.isLoading && !leadsQuery.data?.items.length ? (
        <EmptyState title="No VIP leads found." subtitle="Try adjusting filters or switch Pool / My leads." />
      ) : null}

      {leadsQuery.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Photo</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Bio</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Profession</th>
                  <th className="px-3 py-2">Education</th>
                  <th className="px-3 py-2">Industry</th>
                  <th className="px-3 py-2">Income</th>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">DOB</th>
                  <th className="px-3 py-2">Marital</th>
                  <th className="px-3 py-2">Height</th>
                  <th className="px-3 py-2">Verified</th>
                  <th className="px-3 py-2">Photos</th>
                  <th className="px-3 py-2">VIP plan</th>
                  <th className="px-3 py-2">Requests</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Last requested</th>
                  <th className="px-3 py-2">Follow-up</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {leadsQuery.data.items.map((lead) => (
                  <tr key={lead.userId} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2">
                      <VipLeadLink userId={lead.userId} label={lead.fullName ?? lead.userId} />
                    </td>
                    <td className="px-3 py-2">
                      <LeadPhotoThumb
                        url={lead.primaryImageUrl}
                        alt={`${lead.fullName ?? lead.userId} photo`}
                      />
                    </td>
                    <td className="px-3 py-2">{lead.status}</td>
                    <td className="max-w-[220px] px-3 py-2">
                      {lead.bio ? (
                        <p className="line-clamp-2" title={lead.bio}>
                          {lead.bio}
                        </p>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="px-3 py-2">{lead.state ?? '--'}</td>
                    <td className="px-3 py-2">{lead.city ?? '--'}</td>
                    <td className="px-3 py-2">{lead.profession ?? '--'}</td>
                    <td className="px-3 py-2">{lead.education ?? '--'}</td>
                    <td className="px-3 py-2">{lead.industry ?? '--'}</td>
                    <td className="px-3 py-2">{lead.incomeLabel ?? '--'}</td>
                    <td className="px-3 py-2">{lead.age ?? '--'}</td>
                    <td className="px-3 py-2">{formatDate(lead.dateOfBirth)}</td>
                    <td className="px-3 py-2">{lead.maritalStatus ?? '--'}</td>
                    <td className="px-3 py-2">{lead.height != null ? `${lead.height} cm` : '--'}</td>
                    <td className="px-3 py-2">
                      {lead.verifiedProfile == null ? '--' : lead.verifiedProfile ? 'Yes' : 'No'}
                    </td>
                    <td className="px-3 py-2">{lead.approvedPhotoCount ?? '--'}</td>
                    <td className="px-3 py-2">{lead.vipTitle ?? '--'}</td>
                    <td className="px-3 py-2">{lead.requestCount ?? '--'}</td>
                    <td className="px-3 py-2">
                      {formatInr(lead.discountedPriceInr)}
                      {lead.originalPriceInr != null ? (
                        <span className="ml-1 text-xs text-slate-400 line-through">
                          {formatInr(lead.originalPriceInr)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{lead.assignedToAdminId ?? '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.lastRequestedAt)}</td>
                    <td className="px-3 py-2">{formatDateTime(lead.followUpAt)}</td>
                    <td className="px-3 py-2">
                      <Link
                        className="underline"
                        to={routes.vipLeadDetail(lead.userId)}
                        state={{ vipListSearch: location.search }}
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
        <p className="text-sm text-slate-500">
          Page {parsed.page + 1} of {totalPages}
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
    </section>
  )
}
