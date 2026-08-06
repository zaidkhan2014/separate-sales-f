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
        ],
      },
    ],
  },
])
