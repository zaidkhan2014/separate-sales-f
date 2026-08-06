import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { routes } from '@/router/paths'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />
  }
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to={routes.leads} replace />
  }
  return <Outlet />
}
