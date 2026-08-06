import { LogOut } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { SalesSubNav } from '@/pages/sales/SalesSubNav'
import { routes } from '@/router/paths'

export function SalesShell() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const staffLabel = session?.staff
    ? `${session.staff.name} (${session.staff.employeeId})`
    : null

  return (
    <div className="min-h-screen min-w-0 bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-slate-900">Qalbi Sales</h1>
            <div className="flex min-w-0 items-center gap-3">
              {staffLabel ? <span className="truncate text-sm text-slate-600">{staffLabel}</span> : null}
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate(routes.login)
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
          <SalesSubNav />
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
