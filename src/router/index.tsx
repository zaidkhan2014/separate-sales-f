/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { SalesShell } from '@/components/layout/SalesShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/router/guards'
import { routes } from '@/router/paths'

const LoginPage = lazy(() => import('@/pages/login/LoginPage'))
const SalesPage = lazy(() => import('@/pages/sales/SalesPage'))
const SalesFollowUpsPage = lazy(() => import('@/pages/sales/SalesFollowUpsPage'))
const SalesPerformancePage = lazy(() => import('@/pages/sales/SalesPerformancePage'))
const SalesLeadDetailPage = lazy(() => import('@/pages/sales/SalesLeadDetailPage'))
const DeletedAccountsPage = lazy(() => import('@/pages/deleted-accounts/DeletedAccountsPage'))
const DeletedAccountsFollowUpsPage = lazy(
  () => import('@/pages/deleted-accounts/DeletedAccountsFollowUpsPage'),
)
const DeletedAccountsPerformancePage = lazy(
  () => import('@/pages/deleted-accounts/DeletedAccountsPerformancePage'),
)
const DeletedAccountsLeadDetailPage = lazy(
  () => import('@/pages/deleted-accounts/DeletedAccountsLeadDetailPage'),
)
const DemographicsPage = lazy(() => import('@/pages/demographics/DemographicsPage'))
const VipCustomersPage = lazy(() => import('@/pages/vip/VipCustomersPage'))
const VipFollowUpsPage = lazy(() => import('@/pages/vip/VipFollowUpsPage'))
const VipLeadDetailPage = lazy(() => import('@/pages/vip/VipLeadDetailPage'))

function LoadingRoute() {
  return <div className="p-6 text-sm text-slate-500">Loading page...</div>
}

function RouteBoundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingRoute />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RouteBoundary>
        <PublicOnlyRoute />
      </RouteBoundary>
    ),
    children: [
      {
        path: routes.login.slice(1),
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <RouteBoundary>
        <ProtectedRoute />
      </RouteBoundary>
    ),
    children: [
      {
        element: <SalesShell />,
        children: [
          {
            index: true,
            element: <Navigate to={routes.leads} replace />,
          },
          { path: routes.leads.slice(1), element: <SalesPage /> },
          { path: 'follow-ups', element: <SalesFollowUpsPage /> },
          { path: 'performance', element: <SalesPerformancePage /> },
          { path: 'leads/:userId', element: <SalesLeadDetailPage /> },
          { path: routes.demographics.slice(1), element: <DemographicsPage /> },
          { path: routes.vip.slice(1), element: <VipCustomersPage /> },
          { path: 'vip/follow-ups', element: <VipFollowUpsPage /> },
          { path: 'vip/:userId', element: <VipLeadDetailPage /> },
          { path: 'deleted-accounts', element: <DeletedAccountsPage /> },
          { path: 'deleted-accounts/follow-ups', element: <DeletedAccountsFollowUpsPage /> },
          { path: 'deleted-accounts/performance', element: <DeletedAccountsPerformancePage /> },
          { path: 'deleted-accounts/:userId', element: <DeletedAccountsLeadDetailPage /> },
        ],
      },
    ],
  },
])
