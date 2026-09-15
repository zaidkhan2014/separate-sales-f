import { NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { isSalesAgent } from '@/features/auth/session'
import { cn } from '@/lib/cn'
import { routes } from '@/router/paths'

const links: Array<{ to: string; label: string; end: boolean; hideForAgent?: boolean }> = [
  { to: routes.deletedAccounts, label: 'Leads', end: true },
  { to: routes.deletedAccountsFollowUps, label: 'Follow-ups', end: false },
  { to: routes.deletedAccountsPerformance, label: 'Performance', end: false, hideForAgent: true },
]

export function DeletedAccountsSubNav() {
  const { session } = useAuth()
  const agent = isSalesAgent(session)

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links
        .filter((item) => !(item.hideForAgent && agent))
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'rounded-full border px-3 py-1 text-sm transition',
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
    </nav>
  )
}
