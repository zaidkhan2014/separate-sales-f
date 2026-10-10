import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { routes } from '@/router/paths'

const links: Array<{ to: string; label: string; end: boolean }> = [
  { to: routes.vip, label: 'Leads', end: true },
  { to: routes.vipFollowUps, label: 'Follow-ups', end: false },
]

export function VipSubNav() {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map((item) => (
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
