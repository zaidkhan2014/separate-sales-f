import { useMemo, useState } from 'react'
import type {
  AdminReviewQueueItem,
  ProfileCreatedForFilter,
  ProfileReviewCode,
  ProfileStatusQueue,
} from '@/api/types'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { UserProfileDetailSections } from '@/components/users/UserProfileDetailSections'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminReviewQueue, useForceApproveReview } from '@/hooks/api/useAdminUsers'
import {
  PROFILE_REVIEW_CODES,
  REVIEW_CODE_LABELS,
  approveDisabledReason,
  reviewCodeLabel,
} from '@/pages/review-queue/reviewQueueConstants'
import { PROFILE_CREATED_FOR_FILTER_OPTIONS } from '@/pages/sales/salesConstants'
import { toUtcIso } from '@/utils/date'
import { formatDateTime } from '@/utils/format'

function PhotoThumb({ url, alt }: { url: string | null | undefined; alt: string }) {
  if (!url) {
    return <span className="text-xs text-slate-400">--</span>
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title="Open full size">
      <img
        src={url}
        alt={alt}
        className="h-12 w-12 rounded-md border border-slate-200 object-cover"
        loading="lazy"
      />
    </a>
  )
}

export default function ReviewQueuePage() {
  const [gender, setGender] = useState('')
  const [profileCreatedFor, setProfileCreatedFor] = useState<'' | ProfileCreatedForFilter>('')
  const [profileStatus, setProfileStatus] = useState<'' | ProfileStatusQueue>('')
  const [reviewCode, setReviewCode] = useState<'' | ProfileReviewCode>('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [selected, setSelected] = useState<AdminReviewQueueItem | null>(null)
  const [actionMessage, setActionMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  )

  const filters = {
    gender: gender || undefined,
    profileCreatedFor: profileCreatedFor || undefined,
    profileStatus: profileStatus || undefined,
    reviewCode: reviewCode || undefined,
    start: toUtcIso(start),
    end: toUtcIso(end),
    page,
    size: pageSize,
  }

  const query = useAdminReviewQueue(filters)
  const approveMutation = useForceApproveReview()

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0
    return Math.max(1, Math.ceil(total / pageSize))
  }, [pageSize, query.data?.total])

  async function handleApprove(item: AdminReviewQueueItem) {
    setActionMessage(null)
    try {
      const result = await approveMutation.mutateAsync(item.userId)
      if (result.success) {
        setActionMessage({ tone: 'success', text: `Approved ${item.fullName ?? item.userId}` })
        if (selected?.userId === item.userId) {
          setSelected(null)
        }
        await query.refetch()
        return
      }
      setActionMessage({
        tone: 'error',
        text: result.message ?? 'Force-approve refused',
      })
    } catch (error) {
      setActionMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Force-approve failed',
      })
    }
  }

  return (
    <section className="space-y-4">
      <PageHeader
        title="Review Queue"
        description="Review REJECTED and PENDING onboarded profiles, compare selfie vs primary photo, and force-approve mistaken rejects."
      />

      <Card>
        <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Gender</span>
            <Select
              aria-label="Filter by gender"
              value={gender}
              onChange={(event) => {
                setGender(event.target.value)
                setPage(0)
              }}
            >
              <option value="">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Created for</span>
            <Select
              aria-label="Filter by profile created for"
              value={profileCreatedFor}
              onChange={(event) => {
                setProfileCreatedFor(event.target.value as '' | ProfileCreatedForFilter)
                setPage(0)
              }}
            >
              <option value="">Any</option>
              {PROFILE_CREATED_FOR_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Profile status</span>
            <Select
              aria-label="Filter by profile status"
              value={profileStatus}
              onChange={(event) => {
                setProfileStatus(event.target.value as '' | ProfileStatusQueue)
                setPage(0)
              }}
            >
              <option value="">All (REJECTED + PENDING)</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PENDING">PENDING</option>
            </Select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Review code</span>
            <Select
              aria-label="Filter by review code"
              value={reviewCode}
              onChange={(event) => {
                setReviewCode(event.target.value as '' | ProfileReviewCode)
                setPage(0)
              }}
            >
              <option value="">All codes</option>
              {PROFILE_REVIEW_CODES.map((code) => (
                <option key={code} value={code}>
                  {REVIEW_CODE_LABELS[code]}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Reviewed from (UTC)</span>
            <Input
              type="datetime-local"
              value={start}
              onChange={(event) => {
                setStart(event.target.value)
                setPage(0)
              }}
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Reviewed to (UTC)</span>
            <Input
              type="datetime-local"
              value={end}
              onChange={(event) => {
                setEnd(event.target.value)
                setPage(0)
              }}
            />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Page size</span>
            <Select
              aria-label="Page size"
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(0)
              }}
            >
              <option value="20">20</option>
              <option value="50">50</option>
            </Select>
          </label>
        </CardContent>
      </Card>

      {actionMessage ? (
        <Alert
          className={
            actionMessage.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }
        >
          {actionMessage.text}
        </Alert>
      ) : null}

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`review-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && !query.data?.items.length ? (
        <EmptyState title="No profiles in review queue." subtitle="Try broadening filters." />
      ) : null}

      {query.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">Created for</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Similarity</th>
                  <th className="px-3 py-2">Selfie</th>
                  <th className="px-3 py-2">Primary</th>
                  <th className="px-3 py-2">Reviewed</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((item) => {
                  const disabledReason = approveDisabledReason(item)
                  return (
                    <tr key={item.userId} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2">
                        <UserLink userId={item.userId} label={item.fullName ?? item.userId} />
                        <p className="mt-0.5 font-mono text-xs text-slate-500">{item.memberId ?? item.userId}</p>
                      </td>
                      <td className="px-3 py-2">{item.gender ?? '--'}</td>
                      <td className="px-3 py-2">{item.profileCreatedFor ?? '--'}</td>
                      <td className="px-3 py-2">{item.profileStatus ?? '--'}</td>
                      <td className="max-w-[220px] px-3 py-2">
                        <p className="font-medium text-slate-800">{reviewCodeLabel(item.reviewCode)}</p>
                        {item.reviewMessage ? (
                          <p className="mt-0.5 text-xs text-slate-500">{item.reviewMessage}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">
                        {item.faceSimilarity != null ? item.faceSimilarity.toFixed(1) : '--'}
                      </td>
                      <td className="px-3 py-2">
                        <PhotoThumb url={item.liveSelfieUrl} alt={`${item.fullName ?? item.userId} selfie`} />
                      </td>
                      <td className="px-3 py-2">
                        <PhotoThumb
                          url={item.reviewedPrimaryUrl}
                          alt={`${item.fullName ?? item.userId} primary`}
                        />
                      </td>
                      <td className="px-3 py-2">{formatDateTime(item.reviewReviewedAt)}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" onClick={() => setSelected(item)}>
                            Details
                          </Button>
                          <Button
                            disabled={!item.canForceApprove || approveMutation.isPending}
                            onClick={() => void handleApprove(item)}
                          >
                            Approve
                          </Button>
                          {disabledReason ? (
                            <span className="text-xs text-amber-700">{disabledReason}</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page + 1} of {totalPages}
          {query.data?.total != null ? ` · ${query.data.total} total` : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40">
          <button
            type="button"
            aria-label="Close review details"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelected(null)}
          />
          <aside className="relative z-50 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selected.fullName ?? selected.userId}
                </h2>
                <p className="text-sm text-slate-500">
                  {selected.profileStatus ?? '--'} · {reviewCodeLabel(selected.reviewCode)}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-4 p-4">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm text-slate-700">{selected.reviewMessage ?? 'No review message.'}</p>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-slate-500">Review status</dt>
                      <dd>{selected.reviewStatus ?? '--'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Face similarity</dt>
                      <dd>{selected.faceSimilarity != null ? selected.faceSimilarity.toFixed(1) : '--'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Submitted</dt>
                      <dd>{formatDateTime(selected.reviewSubmittedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Reviewed</dt>
                      <dd>{formatDateTime(selected.reviewReviewedAt)}</dd>
                    </div>
                  </dl>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-500">Live selfie</p>
                      {selected.liveSelfieUrl ? (
                        <a
                          href={selected.liveSelfieUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open full size"
                        >
                          <img
                            src={selected.liveSelfieUrl}
                            alt="Live selfie"
                            className="max-h-56 w-full rounded-lg border border-slate-200 object-contain"
                          />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-400">No selfie URL</p>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-500">Reviewed primary</p>
                      {selected.reviewedPrimaryUrl ? (
                        <a
                          href={selected.reviewedPrimaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open full size"
                        >
                          <img
                            src={selected.reviewedPrimaryUrl}
                            alt="Reviewed primary"
                            className="max-h-56 w-full rounded-lg border border-slate-200 object-contain"
                          />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-400">No primary URL</p>
                      )}
                    </div>
                  </div>
                  {selected.profile.mediaGallery?.items?.length ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-500">Gallery</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.profile.mediaGallery.items
                          .filter((media) => media.url)
                          .map((media) => (
                            <a
                              key={media.publicId ?? media.url}
                              href={media.url ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open full size"
                            >
                              <img
                                src={media.url ?? undefined}
                                alt={media.publicId ?? 'Gallery item'}
                                className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                              />
                            </a>
                          ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <Button
                      disabled={!selected.canForceApprove || approveMutation.isPending}
                      onClick={() => void handleApprove(selected)}
                    >
                      Approve
                    </Button>
                    {approveDisabledReason(selected) ? (
                      <p className="text-xs text-amber-700">{approveDisabledReason(selected)}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <UserProfileDetailSections profile={selected.profile} />
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  )
}
