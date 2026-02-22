import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-[var(--background-light)] bg-gradient-to-b from-[var(--app-gradient-start)] to-[var(--app-gradient-end)] px-6 text-center text-[var(--black)]">
      <p className="text-sm text-[var(--teal-tertiary)]/75">404</p>
      <h1 className="mt-1 text-2xl font-semibold text-[var(--teal-tertiary)]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[var(--teal-tertiary)]/75">
        The page you requested is not available in this sample app.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-[var(--white)] transition hover:bg-[var(--teal-secondary)]"
      >
        Back to Login
      </Link>
    </div>
  )
}
