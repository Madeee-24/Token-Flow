import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const PROVIDER_COLOR = {
  openai: 'var(--color-openai)',
  claude: 'var(--color-claude)',
  gemini: 'var(--color-gemini)',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted">{item.name}</p>
      <p className="font-display text-sm font-bold text-ink tabular-nums">${item.value.toFixed(2)}</p>
    </div>
  )
}

export default function CostPieChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={3}
          cornerRadius={6}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={PROVIDER_COLOR[entry.provider] || 'var(--color-brand-500)'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: 'var(--color-muted)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
