export function RouteFallback() {
  return (
    <div className="flex min-h-full w-full items-center justify-center bg-(--background-light)" role="status">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-(--app-border) border-t-(--teal-primary)" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
