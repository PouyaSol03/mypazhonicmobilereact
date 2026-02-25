import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type Props = { children: React.ReactNode }

/**
 * Protects private routes: redirects to login (/) when there is no session token.
 * Token comes from AuthContext (single source of truth).
 */
export function RequireAuth({ children }: Props) {
  const location = useLocation()
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}
