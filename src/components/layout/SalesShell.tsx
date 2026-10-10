import { Crown, Database, LogOut, PieChart, UserX } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useAdminVipPendingCount } from '@/hooks/api/useAdminVip'
import { cn } from '@/lib/cn'
import { DeletedAccountsSubNav } from '@/pages/deleted-accounts/DeletedAccountsSubNav'
import { SalesSubNav } from '@/pages/sales/SalesSubNav'
import { VipSubNav } from '@/pages/vip/VipSubNav'
import { formatVipPendingBadge } from '@/pages/vip/vipConstants'
import { routes } from '@/router/paths'

function isSalesSection(pathname: string) {
  return (
    pathname === routes.leads ||
    pathname.startsWith(`${routes.leads}/`) ||
    pathname.startsWith(routes.followUps) ||
    pathname.startsWith(routes.performance)
  )
}

function isVipSection(pathname: string) {
  return pathname.startsWith(routes.vip)
}

function isDeletedSection(pathname: string) {
  return pathname.startsWith(routes.deletedAccounts)
}

function isDemographicsSection(pathname: string) {
  return pathname.startsWith(routes.demographics)
}

function sidebarLinkActive(pathname: string, to: string): boolean {
  if (to === routes.leads) return isSalesSection(pathname)
  if (to === routes.vip) return isVipSection(pathname)
  if (to === routes.deletedAccounts) return isDeletedSection(pathname)
  if (to === routes.demographics) return isDemographicsSection(pathname)
  return pathname === to || pathname.startsWith(`${to}/`)
}

const links = [
  { to: routes.demographics, label: 'Demographics', icon: PieChart },
  { to: routes.leads, label: 'Sales', icon: Database },
  { to: routes.vip, label: 'VIP Customers', icon: Crown, showVipBadge: true },
  { to: routes.deletedAccounts, label: 'Deleted Accounts', icon: UserX },
] as const

function VipPendingBadge({ count, compact }: { count: number; compact?: boolean }) {
  const label = formatVipPendingBadge(count)
  if (!label) return null
  return (
    <span
      className={cn(
        'absolute flex items-center justify-center rounded-full bg-red-500 font-semibold text-white',
        compact
          ? '-right-1.5 -top-1.5 min-h-[1rem] min-w-[1rem] px-1 text-[9px] leading-none'
          : '-right-2 -top-2 min-h-[1.125rem] min-w-[1.125rem] px-1 text-[10px] leading-none',
      )}
      aria-label={`${count} pending VIP leads`}
    >
      {label}
    </span>
  )
}

function sectionSubNav(pathname: string) {
  if (isDeletedSection(pathname)) {
    return <DeletedAccountsSubNav />
  }
  if (isVipSection(pathname)) {
    return <VipSubNav />
  }
  if (isSalesSection(pathname)) {
    return <SalesSubNav />
  }
  return null
}

export function SalesShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, logout } = useAuth()
  const pendingQuery = useAdminVipPendingCount()
  const pendingCount = pendingQuery.isLoading ? 0 : (pendingQuery.data ?? 0)
  const staffLabel = session?.staff
    ? `${session.staff.name} (${session.staff.employeeId})`
    : null
  const subNav = sectionSubNav(location.pathname)

  return (
    <div className="min-h-screen min-w-0 bg-slate-50 md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-10 flex h-fit min-w-0 items-center justify-between border-b border-slate-200 bg-white p-3 md:h-screen md:flex-col md:items-stretch md:justify-start md:overflow-hidden md:border-b-0 md:border-r md:p-4">
        <div className="min-w-0 md:min-h-0 md:flex-1 md:overflow-y-auto">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Qalbi Sales</h2>
          <nav className="hidden space-y-1 md:block">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === routes.demographics}
                className={() =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100',
                    sidebarLinkActive(location.pathname, item.to) &&
                      'bg-slate-900 text-white hover:bg-slate-900',
                  )
                }
              >
                <span className="relative inline-flex shrink-0">
                  <item.icon size={16} />
                  {'showVipBadge' in item && item.showVipBadge ? (
                    <VipPendingBadge count={pendingCount} />
                  ) : null}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate(routes.login)
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 md:mt-auto md:border-t md:border-slate-200 md:pt-3"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
      <main className="min-w-0 p-4 md:p-6">
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto md:hidden">
              {links.map((item) => (
                <NavLink
                  key={`mobile-${item.to}`}
                  to={item.to}
                  end={item.to === routes.demographics}
                  className={() =>
                    cn(
                      'relative rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600',
                      sidebarLinkActive(location.pathname, item.to) &&
                        'border-slate-900 bg-slate-900 text-white',
                    )
                  }
                >
                  {item.label}
                  {'showVipBadge' in item && item.showVipBadge ? (
                    <VipPendingBadge count={pendingCount} compact />
                  ) : null}
                </NavLink>
              ))}
            </div>
            {staffLabel ? <span className="truncate text-sm text-slate-600">{staffLabel}</span> : null}
          </div>
          {subNav ? <div className="mb-4">{subNav}</div> : null}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
