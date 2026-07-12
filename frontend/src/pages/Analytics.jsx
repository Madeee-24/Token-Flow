import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import TokenLineChart from '../components/charts/TokenLineChart'
import CostPieChart from '../components/charts/CostPieChart'
import { ChartSkeleton, ErrorState } from '../components/States'
import { getAnalytics } from '../services/api'

const RANGES = ['7d', '14d', '30d']
const MODEL_FILTERS = ['all', 'openai', 'claude', 'gemini']

export default function Analytics() {
  const [state, setState] = useState({ loading: true, error: false })
  const [data, setData] = useState(null)
  const [range, setRange] = useState('14d')
  const [modelFilter, setModelFilter] = useState('all')

  async function load() {
    setState({ loading: true, error: false })
    try {
      const result = await getAnalytics({ range, provider: modelFilter })
      setData(result)
      setState({ loading: false, error: false })
    } catch {
      setState({ loading: false, error: true })
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, modelFilter])

  const filteredDaily = useMemo(() => {
    if (!data) return []
    const dailyUsage = Array.isArray(data.dailyUsage) ? data.dailyUsage : Array.isArray(data.daily_usage) ? data.daily_usage : []
    const cut = range === '7d' ? 7 : range === '14d' ? 14 : dailyUsage.length
    return dailyUsage.slice(-cut)
  }, [data, range])

  const filteredModels = useMemo(() => {
    if (!data) return []
    const modelUsage = Array.isArray(data.modelUsage) ? data.modelUsage : Array.isArray(data.model_usage) ? data.model_usage : []
    if (modelFilter === 'all') return modelUsage
    return modelUsage.filter((m) => (m.provider || '').toLowerCase() === modelFilter)
  }, [data, modelFilter])

  const filteredCost = useMemo(() => {
    if (!data) return []
    const costBreakdown = Array.isArray(data.costBreakdown) ? data.costBreakdown : Array.isArray(data.cost_breakdown) ? data.cost_breakdown : []
    if (modelFilter === 'all') return costBreakdown
    return costBreakdown.filter((c) => (c.provider || '').toLowerCase() === modelFilter)
  }, [data, modelFilter])

  const filteredRequests = useMemo(() => {
    if (!data) return []
    const requestFrequency = Array.isArray(data.requestFrequency) ? data.requestFrequency : Array.isArray(data.request_frequency) ? data.request_frequency : []
    const cut = range === '7d' ? 7 : range === '14d' ? 14 : requestFrequency.length
    return requestFrequency.slice(-cut)
  }, [data, range])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <SlidersHorizontal size={14} /> Filters
        </span>

        <div className="flex rounded-xl border border-border bg-canvas p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === r ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {r === '7d' ? 'Last 7 days' : r === '14d' ? 'Last 14 days' : 'Full range'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap rounded-xl border border-border bg-canvas p-1">
          {MODEL_FILTERS.map((m) => (
            <button
              key={m}
              onClick={() => setModelFilter(m)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                modelFilter === m ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {m === 'all' ? 'All models' : m}
            </button>
          ))}
        </div>
      </div>

      {state.error ? (
        <ErrorState onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {state.loading ? (
            <ChartSkeleton />
          ) : (
            <ChartCard title="Token usage over time" subtitle="Tokens consumed across the selected range" className="xl:col-span-2">
              <TokenLineChart data={filteredDaily} height={300} />
            </ChartCard>
          )}

          {state.loading ? (
            <ChartSkeleton />
          ) : (
            <ChartCard title="Cost breakdown by model" subtitle="Share of total spend per model">
              <CostPieChart data={filteredCost} height={300} />
            </ChartCard>
          )}

          {state.loading ? (
            <ChartSkeleton />
          ) : (
            <ChartCard title="Request frequency" subtitle="API calls per day">
              <TokenLineChart data={filteredRequests} dataKey="requests" height={300} />
            </ChartCard>
          )}

          {!state.loading && (
            <ChartCard title="Model breakdown" subtitle="Requests and spend per model" className="xl:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredModels.map((m) => (
                  <div key={m.model} className="rounded-xl border border-border p-4">
                    <p className="font-display text-sm font-bold text-ink">{m.model}</p>
                    <p className="mt-1 text-xs text-muted capitalize">{m.provider}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted">Tokens</span>
                      <span className="font-semibold tabular-nums text-ink">{m.tokens.toLocaleString()}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted">Requests</span>
                      <span className="font-semibold tabular-nums text-ink">{m.requests.toLocaleString()}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted">Cost</span>
                      <span className="font-semibold tabular-nums text-ink">${m.cost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}
