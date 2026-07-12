const LEVEL_STYLE = {
  50: { ring: 'ring-teal-500/30', dot: 'bg-teal-500', text: 'text-teal-600' },
  80: { ring: 'ring-amber-500/30', dot: 'bg-amber-500', text: 'text-amber-600' },
  90: { ring: 'ring-amber-500/30', dot: 'bg-amber-500', text: 'text-amber-600' },
  100: { ring: 'ring-rose-500/30', dot: 'bg-rose-500', text: 'text-rose-600' },
}

export default function ThresholdToggle({ threshold, enabled, onChange }) {
  const style = LEVEL_STYLE[threshold] || LEVEL_STYLE[50]

  return (
    <div className={`flex items-center justify-between rounded-xl border border-border p-4 ring-1 ring-transparent transition-shadow ${enabled ? style.ring : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
        <div>
          <p className="font-display text-sm font-bold text-ink">{threshold}% threshold</p>
          <p className="text-xs text-muted">
            Notify when usage reaches {threshold}% of your monthly limit
          </p>
        </div>
      </div>

      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-border'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}
