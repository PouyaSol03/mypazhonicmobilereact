import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center text-(--black)">
      <p className="text-sm text-(--teal-tertiary)/75">404</p>
      <h1 className="mt-1 text-2xl font-semibold text-(--teal-tertiary)">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-(--teal-tertiary)/75">
        The page you requested is not available in this sample app.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-(--app-primary) px-5 py-3 text-sm font-semibold text-(--white) transition hover:bg-(--teal-secondary)"
      >
        Back to Login
      </Link>
    </div>
  )
}
