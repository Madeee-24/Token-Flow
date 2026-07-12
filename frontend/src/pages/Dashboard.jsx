import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Activity, DollarSign, Sparkles } from 'lucide-react'
import { UsageBarChart, UsagePieChart, UsageTrendChart } from '../components/Charts'
import StatsCard from '../components/StatsCard'
import { getUsageData } from '../services/usageApi'

export default function Dashboard() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsage = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getUsageData()
      setProviders(Array.isArray(data?.providers) ? data.providers : [])
    } catch (err) {
      setError('Backend not connected')
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsage()
    const interval = window.setInterval(loadUsage, 10000)
    return () => window.clearInterval(interval)
  }, [])

  const transformedData = useMemo(() => {
    return providers.map((provider) => {
      const limit = Number(provider.limit ?? 0)
      const used = Number(provider.tokens_used ?? 0)
      const remaining = Math.max(limit - used, 0)
      const usagePercentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0

      return {
        name: provider.name,
        tokens_used: used,
        remaining,
        usage_percentage: Number(usagePercentage.toFixed(1)),
        cost: Number(provider.cost ?? 0),
      }
    })
  }, [providers])

  const totals = useMemo(() => {
    const totalTokens = transformedData.reduce((sum, item) => sum + item.tokens_used, 0)
    const totalCost = transformedData.reduce((sum, item) => sum + item.cost, 0)
    const activeProviders = transformedData.filter((item) => item.tokens_used > 0).length

    return { totalTokens, totalCost, activeProviders }
  }, [transformedData])

  const alertState = useMemo(() => {
    const over80 = transformedData.some((item) => item.usage_percentage > 80)
    const over95 = transformedData.some((item) => item.usage_percentage > 95)
    if (over95) return { tone: 'critical', label: 'Critical usage detected' }
    if (over80) return { tone: 'warning', label: 'High usage warning' }
    return { tone: 'default', label: 'Usage is stable' }
  }, [transformedData])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-brand-500/10 via-surface to-teal-500/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">LLM Usage Monitoring</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Live provider performance</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">Real-time usage insights from your FastAPI backend, refreshed every 10 seconds.</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${alertState.tone === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-700' : alertState.tone === 'critical' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-border bg-surface text-muted'}`}>
            <AlertTriangle size={16} />
            {alertState.label}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total tokens used" value={loading ? '—' : totals.totalTokens.toLocaleString()} subtitle="Across all providers" />
        <StatsCard title="Total cost" value={loading ? '—' : `$${totals.totalCost.toFixed(2)}`} subtitle="Current spend" />
        <StatsCard title="Active providers" value={loading ? '—' : totals.activeProviders.toString()} subtitle="With tracked usage" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Token usage by provider</h2>
              <p className="text-sm text-muted">Bars show the current token consumption.</p>
            </div>
            <div className="rounded-full bg-brand-50 p-2 text-brand-500">
              <Sparkles size={16} />
            </div>
          </div>
          {loading ? <div className="h-[280px] animate-pulse rounded-2xl bg-canvas" /> : <UsageBarChart data={transformedData} />}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Usage distribution</h2>
              <p className="text-sm text-muted">Each slice reflects provider token share.</p>
            </div>
            <div className="rounded-full bg-teal-50 p-2 text-teal-600">
              <Activity size={16} />
            </div>
          </div>
          {loading ? <div className="h-[280px] animate-pulse rounded-2xl bg-canvas" /> : <UsagePieChart data={transformedData} />}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Provider usage details</h2>
            <p className="text-sm text-muted">Live % usage with alerts and remaining capacity.</p>
          </div>
          <div className="rounded-full bg-amber-50 p-2 text-amber-600">
            <DollarSign size={16} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {transformedData.map((provider) => {
            const tone = provider.usage_percentage > 95 ? 'critical' : provider.usage_percentage > 80 ? 'warning' : 'default'
            return (
              <div key={provider.name} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{provider.name}</h3>
                    <p className="text-sm text-muted">{provider.tokens_used.toLocaleString()} used</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === 'warning' ? 'bg-amber-50 text-amber-700' : tone === 'critical' ? 'bg-rose-50 text-rose-700' : 'bg-brand-50 text-brand-600'}`}>
                    {provider.usage_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
                  <div className={`h-full rounded-full ${tone === 'warning' ? 'bg-amber-500' : tone === 'critical' ? 'bg-rose-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(provider.usage_percentage, 100)}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <span>Cost: ${provider.cost.toFixed(2)}</span>
                  <span>Remaining: {provider.remaining.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Trend overview</h2>
        <p className="mt-1 text-sm text-muted">A lightweight simulated trend line based on current usage percentages.</p>
        {loading ? <div className="mt-4 h-[220px] animate-pulse rounded-2xl bg-canvas" /> : <UsageTrendChart data={transformedData} />}
      </div>
    </div>
  )
}
