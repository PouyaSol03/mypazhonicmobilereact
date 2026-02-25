import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type Props = { children: React.ReactNode }

/**
 * For public routes (login/register): redirects to /app/home when user already has a session.
 */
export function RedirectIfAuth({ children }: Props) {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/app/home" replace />
  }

  return <>{children}</>
}
