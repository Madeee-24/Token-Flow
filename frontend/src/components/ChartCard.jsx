export default function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
