import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const ACCENTS = {
  brand: { blob: 'bg-brand-500', chip: 'bg-brand-50 text-brand-600' },
  teal: { blob: 'bg-teal-500', chip: 'bg-teal-50 text-teal-600' },
  amber: { blob: 'bg-amber-500', chip: 'bg-amber-50 text-amber-600' },
  rose: { blob: 'bg-rose-500', chip: 'bg-rose-50 text-rose-600' },
}

/**
 * Reusable summary card for top-line stats.
 * trend: positive number = up, negative = down. `trendGood` controls color
 * semantics (e.g. rising cost is not "good" even though the number is up).
 */
export default function StatCard({ label, value, sublabel, icon: Icon, trend, trendGood = true, accent = 'brand' }) {
  const hasTrend = typeof trend === 'number'
  const isUp = trend > 0
  const goodColor = isUp === trendGood
  const trendColor = goodColor ? 'text-teal-600' : 'text-rose-500'
  const a = ACCENTS[accent] || ACCENTS.brand

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] ${a.blob}`} aria-hidden="true" />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.chip}`}>
            <Icon size={18} strokeWidth={2.25} />
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-2xl font-bold tabular-nums text-ink sm:text-3xl">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {hasTrend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
        {sublabel && <span className="text-xs text-muted">{sublabel}</span>}
      </div>
    </div>
  )
}
