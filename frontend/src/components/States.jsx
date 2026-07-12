import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="h-3 w-24 rounded bg-canvas" />
      <div className="mt-4 h-7 w-32 rounded bg-canvas" />
      <div className="mt-3 h-2.5 w-16 rounded bg-canvas" />
    </div>
  )
}

export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="h-3 w-32 rounded bg-canvas" />
      <div className="mt-2 h-2.5 w-48 rounded bg-canvas" />
      <div className="mt-6 rounded-xl bg-canvas" style={{ height }} />
    </div>
  )
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 w-full rounded-lg bg-canvas" />
      ))}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-muted">
        <Inbox size={20} />
      </span>
      <p className="font-display text-sm font-bold text-ink">{title}</p>
      {message && <p className="max-w-xs text-xs text-muted">{message}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong while loading this data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-50 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-500">
        <AlertTriangle size={20} />
      </span>
      <p className="font-display text-sm font-bold text-rose-500">Couldn't load this data</p>
      <p className="max-w-xs text-xs text-rose-500/80">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
        >
          <RefreshCw size={13} /> Try again
        </button>
      )}
    </div>
  )
}
