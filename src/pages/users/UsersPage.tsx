import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminUsersSearch, type UserListMode } from '@/hooks/api/useAdminUsers'
import type { AccountStatus, BioModerationStatus, ProfileStatus } from '@/api/types'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { toUtcIso } from '@/utils/date'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20
const modeOptions: Array<{ label: string; value: UserListMode }> = [
  { label: 'Search', value: 'search' },
  { label: 'Newly Joined', value: 'newly-joined' },
  { label: 'Profile Rejected', value: 'profile-rejected' },
  { label: 'Bio Rejected', value: 'bio-rejected' },
  { label: 'Deleted Users', value: 'deleted' },
]

export default function UsersPage() {
  const [mode, setMode] = useState<UserListMode>('search')
  const [queryInput, setQueryInput] = useState('')
  const [profileStatus, setProfileStatus] = useState<'' | ProfileStatus>('')
  const [bioModerationStatus, setBioModerationStatus] = useState<'' | BioModerationStatus>('')
  const [accountStatus, setAccountStatus] = useState<'' | AccountStatus>('')
  const [gender, setGender] = useState('')
  const [subscribed, setSubscribed] = useState('')
  const [createdStart, setCreatedStart] = useState('')
  const [createdEnd, setCreatedEnd] = useState('')
  const [page, setPage] = useState(0)
  const debouncedQuery = useDebouncedValue(queryInput)

  const query = useAdminUsersSearch({
    query: mode === 'search' ? debouncedQuery || undefined : undefined,
    profileStatus: profileStatus || undefined,
    bioModerationStatus: bioModerationStatus || undefined,
    accountStatus: accountStatus || undefined,
    gender: gender || undefined,
    subscribed: subscribed === '' ? undefined : subscribed === 'true',
    createdStart: toUtcIso(createdStart),
    createdEnd: toUtcIso(createdEnd),
    page,
    size: PAGE_SIZE,
  }, mode)

  const totalPages = useMemo(() => {
    const total = query.data?.total ?? 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [query.data?.total])

  return (
    <section className="space-y-4">
      <PageHeader title="User Directory" description="Search users and open profile details." />
      <Card>
        <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">
          <Select
            aria-label="user list mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as UserListMode)
              setPage(0)
            }}
          >
            {modeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            aria-label="search users"
            placeholder="Search by userId/memberId/phone/fullName"
            value={queryInput}
            onChange={(event) => {
              setQueryInput(event.target.value)
              setPage(0)
            }}
            disabled={mode !== 'search'}
          />
          <Select value={profileStatus} onChange={(event) => setProfileStatus(event.target.value as '' | ProfileStatus)}>
            <option value="">Any profile status</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
          </Select>
          <Select
            value={bioModerationStatus}
            onChange={(event) => setBioModerationStatus(event.target.value as '' | BioModerationStatus)}
          >
            <option value="">Any bio status</option>
            <option value="PENDING_REVIEW">PENDING_REVIEW</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </Select>
          <Select value={accountStatus} onChange={(event) => setAccountStatus(event.target.value as '' | AccountStatus)}>
            <option value="">Any account status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DELETED">DELETED</option>
            <option value="BANNED">BANNED</option>
          </Select>
          <Input placeholder="Gender" value={gender} onChange={(event) => setGender(event.target.value)} />
          <Select value={subscribed} onChange={(event) => setSubscribed(event.target.value)}>
            <option value="">Subscribed: Any</option>
            <option value="true">Subscribed: Yes</option>
            <option value="false">Subscribed: No</option>
          </Select>
          <Input
            type="datetime-local"
            placeholder="Created start"
            value={createdStart}
            onChange={(event) => setCreatedStart(event.target.value)}
          />
          <Input
            type="datetime-local"
            placeholder="Created end"
            value={createdEnd}
            onChange={(event) => setCreatedEnd(event.target.value)}
          />
        </CardContent>
      </Card>

      <QueryFeedback loading={false} error={query.error} onRetry={() => void query.refetch()} />

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`user-row-${index + 1}`} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {!query.isLoading && !query.data?.items.length ? (
        <EmptyState title="No users found." subtitle="Try a different search value." />
      ) : null}

      {query.data?.items.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">User ID</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Last Activity</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.items.map((user) => (
                  <tr key={user.userId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <UserLink userId={user.userId} label={user.fullName ?? user.userId} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      <UserLink userId={user.userId} />
                    </td>
                    <td className="px-3 py-2">{user.phone || '--'}</td>
                    <td className="px-3 py-2">{user.accountStatus ?? '--'}</td>
                    <td className="px-3 py-2">{formatDateTime(user.lastActivityAt)}</td>
                    <td className="px-3 py-2">
                      <UserLink userId={user.userId} label="View" />
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
          Page {page + 1} of {totalPages}
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
    </section>
  )
}
