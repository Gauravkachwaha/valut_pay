import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasRole } from '../../utils/normalizeRole'

export default function PrivateRoute({ roles }) {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cred-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cred-gold border-t-transparent" />
      </div>

    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !hasRole(role, roles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
