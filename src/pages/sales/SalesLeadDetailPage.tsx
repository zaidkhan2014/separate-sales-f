import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { LeadUserLabel } from '@/components/common/LeadUserLabel'
import { UserProfileDetailSections } from '@/components/users/UserProfileDetailSections'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminSalesOutcomeReason, AdminSalesStatus } from '@/api/types'
import { useAuth } from '@/features/auth/useAuth'
import { getStaffEmployeeId, isSalesManagerOrAbove } from '@/features/auth/session'
import {
  useAdminSalesActivities,
  useAdminSalesLeadDetail,
  useAssignSalesLead,
  useClaimSalesLead,
  useLogSalesCommunication,
  useReleaseSalesLead,
  useUpdateSalesFollowUp,
  useUpdateSalesNote,
  useUpdateSalesStatus,
} from '@/hooks/api/useAdminSales'
import {
  ADMIN_SALES_OUTCOME_REASONS,
  ADMIN_SALES_STATUSES,
  statusRequiresOutcomeReason,
} from '@/pages/sales/salesConstants'
import { routes } from '@/router/paths'
import { toDatetimeLocalInput, toUtcIso } from '@/utils/date'
import { formatDateTime, formatNumber } from '@/utils/format'
import { getInitialsFromFullName, getPrimaryGalleryImageUrl } from '@/utils/profileMedia'

const engagementFields = [
  'reportsAgainstUser',
  'blocksByUser',
  'blocksAgainstUser',
  'activeMatches',
  'initiatedChats',
  'interactionsSent',
] as const

type SalesDetailLocationState = {
  salesListSearch?: string
}

function salesListSearchForLink(raw?: string): string {
  if (!raw) return ''
  return raw.startsWith('?') ? raw.slice(1) : raw
}

function syncDetailForms(data: {
  salesStatus: string
  lastCalledAt: string | null
  followUpAt: string | null
  outcomeReason: AdminSalesOutcomeReason | null
}): {
  status: AdminSalesStatus
  lastCalledAt: string
  followUpAt: string
  outcomeReason: AdminSalesOutcomeReason | ''
} {
  return {
    status: data.salesStatus as AdminSalesStatus,
    lastCalledAt: toDatetimeLocalInput(data.lastCalledAt ?? undefined),
    followUpAt: toDatetimeLocalInput(data.followUpAt ?? undefined),
    outcomeReason: data.outcomeReason ?? '',
  }
}

export default function SalesLeadDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const location = useLocation()
  const { session } = useAuth()
  const state = location.state as SalesDetailLocationState | null
  const backSearch = salesListSearchForLink(state?.salesListSearch)

  const query = useAdminSalesLeadDetail(userId)
  const activitiesQuery = useAdminSalesActivities(userId, { page: 0, size: 20 })
  const updateStatus = useUpdateSalesStatus(userId ?? '')
  const updateNote = useUpdateSalesNote(userId ?? '')
  const updateFollowUp = useUpdateSalesFollowUp(userId ?? '')
  const claimLead = useClaimSalesLead(userId ?? '')
  const releaseLead = useReleaseSalesLead(userId ?? '')
  const assignLead = useAssignSalesLead(userId ?? '')
  const logCommunication = useLogSalesCommunication(userId ?? '')

  const [status, setStatus] = useState<AdminSalesStatus>('CALL_REMAINING')
  const [outcomeReason, setOutcomeReason] = useState<AdminSalesOutcomeReason | ''>('')
  const [lastCalledAt, setLastCalledAt] = useState('')
  const [note, setNote] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')
  const [assignEmployeeId, setAssignEmployeeId] = useState('')
  const [whatsappTemplate, setWhatsappTemplate] = useState('')
  const [whatsappNote, setWhatsappNote] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const employeeId = getStaffEmployeeId()
  const canAssign = isSalesManagerOrAbove(session)

  useEffect(() => {
    if (!query.data) return
    const synced = syncDetailForms(query.data)
    setStatus(synced.status)
    setLastCalledAt(synced.lastCalledAt)
    setFollowUpAt(synced.followUpAt)
    setOutcomeReason(synced.outcomeReason)
  }, [query.data])

  const isBusy =
    updateStatus.isPending ||
    updateNote.isPending ||
    updateFollowUp.isPending ||
    claimLead.isPending ||
    releaseLead.isPending ||
    assignLead.isPending ||
    logCommunication.isPending ||
    query.isRefetching

  const profile = query.data?.profile
  const mainImageUrl = profile ? getPrimaryGalleryImageUrl(profile) : null
  const displayName = profile?.basicDetails?.fullName?.trim() || profile?.userId || userId
  const photoAlt = displayName ? `Profile photo for ${displayName}` : 'Profile photo'

  const showOutcomeReason = statusRequiresOutcomeReason(status)
  const canClaim =
    query.data &&
    (query.data.salesStatus === 'CALL_REMAINING' || query.data.salesStatus === 'IN_PROCESS') &&
    !query.data.assignedToAdminId
  const canRelease = Boolean(query.data?.assignedToAdminId)

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null)
    try {
      await action()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Action failed')
    }
  }

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader title="Sales Lead Detail" description={`Manage sales lead for ${userId ?? '--'}.`} />
      <Link to={{ pathname: routes.leads, search: backSearch }} className="text-sm text-slate-700 underline">
        Back to sales
      </Link>

      {actionError ? <Alert className="border-red-200 bg-red-50 text-red-700">{actionError}</Alert> : null}

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />
      {query.isLoading ? <Skeleton className="h-80 w-full" /> : null}

      {query.data ? (
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={isBusy || !canClaim}
              onClick={() => runAction(() => claimLead.mutateAsync())}
            >
              Claim lead
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy || !canRelease}
              onClick={() => runAction(() => releaseLead.mutateAsync())}
            >
              Release to pool
            </Button>
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start">
            <div className="mx-auto w-full max-w-full min-w-0 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:max-w-md lg:mx-0 lg:w-80">
              <div className="aspect-square w-full">
                {mainImageUrl ? (
                  <img src={mainImageUrl} alt={photoAlt} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-6 text-center text-lg font-medium text-slate-500">
                    {getInitialsFromFullName(profile?.basicDetails?.fullName ?? null) ?? 'No photo'}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales & activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="User ID" value={<LeadUserLabel userId={query.data.profile.userId} />} />
                  <Row label="Sales status" value={query.data.salesStatus} />
                  <Row label="Lead score" value={String(query.data.leadScore ?? '--')} />
                  <Row label="Assigned to" value={query.data.assignedToAdminId ?? '--'} />
                  <Row label="Claimed at" value={formatDateTime(query.data.claimedAt)} />
                  <Row label="Outcome reason" value={query.data.outcomeReason ?? '--'} />
                  <Row label="Converted at" value={formatDateTime(query.data.convertedAt)} />
                  <Row label="Latest note" value={query.data.note || '--'} />
                  <Row label="Follow-up at" value={formatDateTime(query.data.followUpAt)} />
                  <Row label="Last called at" value={formatDateTime(query.data.lastCalledAt)} />
                  <Row label="Sales record created" value={formatDateTime(query.data.salesCreatedAt)} />
                  <Row label="Sales record updated" value={formatDateTime(query.data.salesUpdatedAt)} />
                  <Row label="OTP verified" value={query.data.otpVerified ? 'Yes' : 'No'} />
                  <Row label="Profile registered" value={query.data.profileRegistered ? 'Yes' : 'No'} />
                  <Row label="Signup at" value={formatDateTime(query.data.signupAt)} />
                  <Row label="Last login at" value={formatDateTime(query.data.lastLoginAt)} />
                  <Row label="Last activity at" value={formatDateTime(query.data.lastActivityAt)} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Engagement counters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {engagementFields.map((field) => (
                    <div key={field} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs uppercase text-slate-500">{field}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{formatNumber(query.data[field])}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Full profile</CardTitle>
            </CardHeader>
            <CardContent>
              <UserProfileDetailSections profile={query.data.profile} />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as AdminSalesStatus)}
                  disabled={isBusy}
                >
                  {ADMIN_SALES_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                {showOutcomeReason ? (
                  <Select
                    value={outcomeReason}
                    onChange={(event) => setOutcomeReason(event.target.value as AdminSalesOutcomeReason)}
                    disabled={isBusy}
                    aria-label="Outcome reason"
                  >
                    <option value="">Select outcome reason…</option>
                    {ADMIN_SALES_OUTCOME_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </Select>
                ) : null}
                <Input
                  type="datetime-local"
                  value={lastCalledAt}
                  onChange={(event) => setLastCalledAt(event.target.value)}
                  disabled={isBusy}
                  aria-label="Last called at"
                />
                <p className="text-xs text-slate-500">
                  Leave last called empty for ALREADY_CALLED or CALL_NOT_PICKED — server stamps current time.
                </p>
                <Button
                  disabled={isBusy || (showOutcomeReason && !outcomeReason)}
                  onClick={() =>
                    runAction(() =>
                      updateStatus.mutateAsync({
                        status,
                        lastCalledAt: toUtcIso(lastCalledAt) ?? null,
                        outcomeReason: showOutcomeReason ? (outcomeReason || null) : null,
                      }),
                    )
                  }
                >
                  Update Status
                </Button>

                <Input
                  placeholder="Write note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={isBusy}
                />
                <p className="text-xs text-slate-500">
                  Notes are saved as employeeId: <strong>{employeeId ?? '(sign in as staff)'}</strong>
                </p>
                <Button
                  disabled={isBusy || note.trim().length === 0}
                  onClick={() =>
                    runAction(() =>
                      updateNote.mutateAsync({
                        note,
                        adminUserId: employeeId,
                      }),
                    )
                  }
                >
                  Save Note
                </Button>

                <Input
                  type="datetime-local"
                  value={followUpAt}
                  onChange={(event) => setFollowUpAt(event.target.value)}
                  disabled={isBusy}
                  aria-label="Follow-up at"
                />
                <div className="flex gap-2">
                  <Button
                    disabled={isBusy}
                    onClick={() =>
                      runAction(() =>
                        updateFollowUp.mutateAsync({
                          followUpAt: toUtcIso(followUpAt) ?? null,
                        }),
                      )
                    }
                  >
                    Save Follow-up
                  </Button>
                  <Button
                    disabled={isBusy}
                    variant="outline"
                    onClick={() => runAction(() => updateFollowUp.mutateAsync({ followUpAt: null }))}
                  >
                    Clear
                  </Button>
                </div>

                {canAssign ? (
                  <>
                    <Input
                      placeholder="Assign to employeeId (empty to unassign)"
                      value={assignEmployeeId}
                      onChange={(event) => setAssignEmployeeId(event.target.value)}
                      disabled={isBusy}
                    />
                    <Button
                      disabled={isBusy}
                      variant="outline"
                      onClick={() =>
                        runAction(() =>
                          assignLead.mutateAsync({
                            assignedToAdminId: assignEmployeeId.trim() || null,
                          }),
                        )
                      }
                    >
                      Assign lead
                    </Button>
                  </>
                ) : null}

                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-2 text-sm font-medium text-slate-800">Log WhatsApp</p>
                  <Input
                    placeholder="Template name"
                    value={whatsappTemplate}
                    onChange={(event) => setWhatsappTemplate(event.target.value)}
                    disabled={isBusy}
                  />
                  <Input
                    className="mt-2"
                    placeholder="Note"
                    value={whatsappNote}
                    onChange={(event) => setWhatsappNote(event.target.value)}
                    disabled={isBusy}
                  />
                  <Button
                    className="mt-2"
                    disabled={isBusy || !whatsappTemplate.trim()}
                    variant="outline"
                    onClick={() =>
                      runAction(() =>
                        logCommunication.mutateAsync({
                          channel: 'WHATSAPP',
                          templateName: whatsappTemplate.trim(),
                          note: whatsappNote.trim() || null,
                        }),
                      )
                    }
                  >
                    Log message
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Note History</CardTitle>
              </CardHeader>
              <CardContent>
                {!query.data.notes.length ? (
                  <p className="text-sm text-slate-500">No notes available.</p>
                ) : (
                  <div className="space-y-2">
                    {query.data.notes.map((entry) => (
                      <div key={`${entry.createdAt}-${entry.text}`} className="rounded-lg border border-slate-200 p-3 text-sm">
                        <p className="text-slate-900">{entry.text}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.adminUserId ?? 'unknown'} — {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <QueryFeedback
                loading={activitiesQuery.isLoading}
                error={activitiesQuery.error}
                onRetry={() => void activitiesQuery.refetch()}
              />
              {!activitiesQuery.isLoading && !activitiesQuery.data?.items.length ? (
                <p className="text-sm text-slate-500">No activities recorded.</p>
              ) : (
                <div className="space-y-2">
                  {activitiesQuery.data?.items.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <p className="font-medium text-slate-900">{entry.type}</p>
                      <p className="text-slate-700">{entry.message}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.actorEmployeeId ?? 'system'} — {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="min-w-0 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 break-words text-left font-medium text-slate-900 sm:max-w-[65%] sm:text-right">
        {value || '--'}
      </span>
    </div>
  )
}
