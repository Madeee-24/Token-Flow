import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

const PROVIDER_COLOR = {
  openai: 'var(--color-openai)',
  claude: 'var(--color-claude)',
  gemini: 'var(--color-gemini)',
}

function formatK(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${Math.round(v / 1000)}K`
  return v
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="font-display text-sm font-bold text-ink tabular-nums">
        {payload[0].value.toLocaleString()} tokens
      </p>
    </div>
  )
}

export default function ModelBarChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="model"
          tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-canvas)' }} />
        <Bar dataKey="tokens" radius={[8, 8, 0, 0]} maxBarSize={44}>
          {data.map((entry) => (
            <Cell key={entry.model} fill={PROVIDER_COLOR[entry.provider] || 'var(--color-brand-500)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
