import { useState } from 'react'
import { Mail, MonitorSmartphone, History } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import ThresholdToggle from '../components/ThresholdToggle'
import { EmptyState } from '../components/States'
import { initialAlertThresholds, alertHistory } from '../data/mockData'

export default function Alerts() {
  const [thresholds, setThresholds] = useState(initialAlertThresholds)
  const [channels, setChannels] = useState({ email: true, inApp: true })

  function updateThreshold(threshold, enabled) {
    setThresholds((prev) => prev.map((t) => (t.threshold === threshold ? { ...t, enabled } : t)))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Usage thresholds" subtitle="Choose when TokenFlow should warn you" className="xl:col-span-2">
          <div className="space-y-3">
            {thresholds.map((t) => (
              <ThresholdToggle
                key={t.threshold}
                threshold={t.threshold}
                enabled={t.enabled}
                onChange={(v) => updateThreshold(t.threshold, v)}
              />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Notification channels" subtitle="Where alerts should be delivered">
          <div className="space-y-3">
            <button
              onClick={() => setChannels((c) => ({ ...c, email: !c.email }))}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                channels.email ? 'border-brand-500/40 bg-brand-50' : 'border-border'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${channels.email ? 'bg-brand-500 text-white' : 'bg-canvas text-muted'}`}>
                  <Mail size={16} />
                </span>
                <span>
                  <p className="font-display text-sm font-bold text-ink">Email</p>
                  <p className="text-xs text-muted">Sent to your account email</p>
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${channels.email ? 'bg-brand-500' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${channels.email ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </span>
            </button>

            <button
              onClick={() => setChannels((c) => ({ ...c, inApp: !c.inApp }))}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                channels.inApp ? 'border-brand-500/40 bg-brand-50' : 'border-border'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${channels.inApp ? 'bg-brand-500 text-white' : 'bg-canvas text-muted'}`}>
                  <MonitorSmartphone size={16} />
                </span>
                <span>
                  <p className="font-display text-sm font-bold text-ink">In-app</p>
                  <p className="text-xs text-muted">Shows as a banner in TokenFlow</p>
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${channels.inApp ? 'bg-brand-500' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${channels.inApp ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </span>
            </button>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Alert history"
        subtitle="A record of every threshold TokenFlow has notified you about"
        action={<History size={16} className="text-muted" />}
      >
        {alertHistory.length === 0 ? (
          <EmptyState title="No alerts yet" message="You'll see a history here once a threshold is crossed." />
        ) : (
          <ul className="divide-y divide-border">
            {alertHistory.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-semibold text-ink-soft">
                    {h.threshold}%
                  </span>
                  <span className="text-sm text-ink-soft">{h.message}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="capitalize">{h.channel}</span>
                  <span>{h.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  )
}
