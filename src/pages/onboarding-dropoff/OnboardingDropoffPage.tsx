import { useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { LeadUserLabel } from '@/components/common/LeadUserLabel'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { DropoffGenderFilter, OnboardingDropoffFilters } from '@/api/types'
import { useAdminOnboardingDropoff } from '@/hooks/api/useAdminAnalytics'
import { cn } from '@/lib/cn'
import {
  DROPOFF_GENDER_TABS,
  ONBOARDING_DROPOFF_PAGE_SIZE,
  buildOnboardingDropoffApplied,
  isValidUtcDay,
} from '@/pages/onboarding-dropoff/onboardingDropoffHelpers'
import { formatDateTime, formatNumber } from '@/utils/format'

export default function OnboardingDropoffPage() {
  const [draftDay, setDraftDay] = useState('')
  const [applied, setApplied] = useState<OnboardingDropoffFilters | null>(null)
  const [dayError, setDayError] = useState<string | null>(null)

  const query = useAdminOnboardingDropoff(applied)
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / ONBOARDING_DROPOFF_PAGE_SIZE))
  const activeGender = applied?.gender ?? 'ALL'
  const activePage = applied?.page ?? 0

  function handleCheck() {
    const next = buildOnboardingDropoffApplied(draftDay)
    if (!next) {
      setDayError('Select a valid UTC day (yyyy-MM-dd) before checking.')
      return
    }
    setDayError(null)
    setApplied(next)
  }

  function setGender(gender: DropoffGenderFilter) {
    if (!applied) return
    setApplied({ ...applied, gender, page: 0 })
  }

  function setPage(page: number) {
    if (!applied) return
    setApplied({ ...applied, page })
  }

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader
        title="Onboarding Dropoff"
        description="Profiles that started registering on a UTC day, uploaded media, but never finished onboarding. First Check for a busy day may take several seconds (Rekognition); repeats for the same day are usually fast."
      />

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Day check</CardTitle>
          <p className="mt-1 text-sm text-slate-600">
            Pick a UTC calendar day, then click <strong>Check</strong>. Changing the date alone does not call the API.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <label className="block min-w-0 text-sm text-slate-600">
            <span className="mb-1 block font-medium text-slate-800">UTC day</span>
            <Input
              type="date"
              value={draftDay}
              onChange={(event) => {
                setDraftDay(event.target.value)
                setDayError(null)
              }}
              aria-label="UTC onboarding day"
              disabled={query.isFetching && Boolean(applied)}
            />
          </label>
          <Button
            type="button"
            onClick={handleCheck}
            disabled={query.isFetching || !isValidUtcDay(draftDay)}
          >
            {query.isFetching ? 'Checking…' : 'Check'}
          </Button>
          {dayError ? <p className="w-full text-sm text-red-600">{dayError}</p> : null}
        </CardContent>
      </Card>

      {!applied ? (
        <EmptyState title="Select a UTC day and click Check" subtitle="No API call until you run Check." />
      ) : null}

      {applied ? (
        <>
          <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
          {query.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`dropoff-count-${index + 1}`} className="h-24 w-full" />
              ))}
            </div>
          ) : null}

          {query.data ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <CountCard label="Male" value={query.data.maleCount} />
                <CountCard label="Female" value={query.data.femaleCount} />
                <CountCard label="Unknown" value={query.data.unknownCount} />
                <CountCard label="Total" value={query.data.totalCount} />
              </div>

              <div className="flex flex-wrap gap-2">
                {DROPOFF_GENDER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition',
                      activeGender === tab.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                    onClick={() => setGender(tab.value)}
                    disabled={query.isFetching}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {query.isFetching && !query.isLoading ? (
                <p className="text-sm text-slate-500">Updating results…</p>
              ) : null}

              {!query.isLoading && !query.data.items.length ? (
                <EmptyState title="No users in this gender filter." />
              ) : null}

              {query.data.items.length ? (
                <Card>
                  <CardContent className="overflow-x-auto p-0">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="px-3 py-2">User</th>
                          <th className="px-3 py-2">Phone</th>
                          <th className="px-3 py-2">Created</th>
                          <th className="px-3 py-2">Media</th>
                          <th className="px-3 py-2">Gender</th>
                          <th className="px-3 py-2">Source</th>
                          <th className="px-3 py-2">Confidence</th>
                          <th className="px-3 py-2">Primary publicId</th>
                        </tr>
                      </thead>
                      <tbody>
                        {query.data.items.map((row) => (
                          <tr key={row.userId} className="border-t border-slate-100">
                            <td className="px-3 py-2">
                              <LeadUserLabel userId={row.userId} label={row.memberId ?? row.userId} />
                            </td>
                            <td className="px-3 py-2">{row.phone ?? '--'}</td>
                            <td className="px-3 py-2">{formatDateTime(row.createdAt)}</td>
                            <td className="px-3 py-2">{row.mediaCount}</td>
                            <td className="px-3 py-2">{row.gender}</td>
                            <td className="px-3 py-2">{row.genderSource}</td>
                            <td className="px-3 py-2">
                              {row.genderCheckConfidence != null
                                ? formatNumber(row.genderCheckConfidence)
                                : '--'}
                            </td>
                            <td className="max-w-[180px] truncate px-3 py-2 font-mono text-xs">
                              {row.primaryPublicId ?? '--'}
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
                  Page {activePage + 1} of {totalPages}
                  {applied.day ? (
                    <span className="ml-2 text-xs text-slate-400">Day {applied.day} (UTC)</span>
                  ) : null}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
                    disabled={activePage === 0 || query.isFetching}
                    onClick={() => setPage(Math.max(0, activePage - 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
                    disabled={activePage + 1 >= totalPages || query.isFetching}
                    onClick={() => setPage(activePage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{formatNumber(value)}</p>
      </CardContent>
    </Card>
  )
}
