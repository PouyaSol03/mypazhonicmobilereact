import { Navigate, useLocation } from 'react-router-dom'
import { getStoredToken } from '../../utils/androidBridge'

type Props = { children: React.ReactNode }

/**
 * Protects private routes: redirects to login (/) when there is no session token.
 */
export function RequireAuth({ children }: Props) {
  const location = useLocation()
  const token = getStoredToken()

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}
