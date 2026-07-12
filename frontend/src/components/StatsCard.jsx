export default function StatsCard({ title, value, subtitle, tone = 'default' }) {
  const toneStyles = {
    default: 'border-border bg-surface text-ink',
    warning: 'border-amber-300 bg-amber-50 text-amber-700',
    critical: 'border-rose-300 bg-rose-50 text-rose-700',
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all ${toneStyles[tone] || toneStyles.default}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {subtitle ? <p className="mt-1 text-sm opacity-70">{subtitle}</p> : null}
    </div>
  )
}
