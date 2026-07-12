// Demo dataset. In production these shapes are what /usage, /analytics,
// and /keys are expected to return — see src/services/api.js.

export const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', color: 'var(--color-openai)' },
  { id: 'claude', label: 'Claude', color: 'var(--color-claude)' },
  { id: 'gemini', label: 'Gemini', color: 'var(--color-gemini)' },
]

export const usageSummary = {
  totalTokens: 8_432_150,
  tokenLimit: 12_000_000,
  usagePercentage: 70.3,
  totalCost: 1284.56,
  totalRequests: 48_920,
  costTrend: 12.4,
  requestsTrend: -3.1,
  tokensTrend: 8.7,
}

// Daily token usage, last 14 days
export const dailyUsage = [
  { date: 'Jun 28', tokens: 412000 },
  { date: 'Jun 29', tokens: 468000 },
  { date: 'Jun 30', tokens: 389000 },
  { date: 'Jul 01', tokens: 512000 },
  { date: 'Jul 02', tokens: 601000 },
  { date: 'Jul 03', tokens: 574000 },
  { date: 'Jul 04', tokens: 498000 },
  { date: 'Jul 05', tokens: 632000 },
  { date: 'Jul 06', tokens: 701000 },
  { date: 'Jul 07', tokens: 655000 },
  { date: 'Jul 08', tokens: 728000 },
  { date: 'Jul 09', tokens: 812000 },
  { date: 'Jul 10', tokens: 774000 },
  { date: 'Jul 11', tokens: 675150 },
]

// Model-wise usage
export const modelUsage = [
  { model: 'GPT-4o', provider: 'openai', tokens: 2_812_400, cost: 421.86, requests: 14_230 },
  { model: 'GPT-4o mini', provider: 'openai', tokens: 1_204_000, cost: 78.2, requests: 9_820 },
  { model: 'Claude Sonnet 5', provider: 'claude', tokens: 2_150_600, cost: 396.4, requests: 11_040 },
  { model: 'Claude Haiku 4.5', provider: 'claude', tokens: 980_300, cost: 62.1, requests: 7_310 },
  { model: 'Gemini 2.5 Pro', provider: 'gemini', tokens: 1_020_500, cost: 258.9, requests: 4_980 },
  { model: 'Gemini 2.5 Flash', provider: 'gemini', tokens: 264_350, cost: 17.1, requests: 1_540 },
]

export const costBreakdown = modelUsage.map((m) => ({
  name: m.model,
  value: Number(m.cost.toFixed(2)),
  provider: m.provider,
}))

export const requestFrequency = dailyUsage.map((d, i) => ({
  date: d.date,
  requests: Math.round(d.tokens / 13.5),
}))

export const recentActivity = [
  { id: 'a1', provider: 'claude', model: 'Claude Sonnet 5', tokens: 18420, cost: 3.42, time: '2 min ago', status: 'success' },
  { id: 'a2', provider: 'openai', model: 'GPT-4o', tokens: 9210, cost: 1.98, time: '9 min ago', status: 'success' },
  { id: 'a3', provider: 'gemini', model: 'Gemini 2.5 Pro', tokens: 24110, cost: 4.61, time: '17 min ago', status: 'success' },
  { id: 'a4', provider: 'openai', model: 'GPT-4o mini', tokens: 5320, cost: 0.44, time: '32 min ago', status: 'failed' },
  { id: 'a5', provider: 'claude', model: 'Claude Haiku 4.5', tokens: 3110, cost: 0.19, time: '48 min ago', status: 'success' },
  { id: 'a6', provider: 'gemini', model: 'Gemini 2.5 Flash', tokens: 7820, cost: 0.51, time: '1 hr ago', status: 'success' },
]

export const initialApiKeys = [
  { id: 'k1', provider: 'openai', label: 'Production — Web App', keyMasked: 'sk-••••••••••••7fA1', createdAt: '2026-05-12', status: 'active' },
  { id: 'k2', provider: 'claude', label: 'Internal Tools', keyMasked: 'sk-ant-••••••••3kD9', createdAt: '2026-06-02', status: 'active' },
  { id: 'k3', provider: 'gemini', label: 'Analytics Pipeline', keyMasked: 'AIza••••••••••Qw2Z', createdAt: '2026-06-20', status: 'revoked' },
]

export const initialAlertThresholds = [
  { threshold: 50, enabled: true },
  { threshold: 80, enabled: true },
  { threshold: 90, enabled: false },
  { threshold: 100, enabled: true },
]

export const alertHistory = [
  { id: 'h1', threshold: 50, message: 'Usage crossed 50% of monthly token limit', time: 'Jul 06, 2026 · 09:14', channel: 'in-app' },
  { id: 'h2', threshold: 80, message: 'Usage crossed 80% of monthly token limit', time: 'Jul 10, 2026 · 22:03', channel: 'email' },
  { id: 'h3', threshold: 50, message: 'Usage crossed 50% of monthly token limit', time: 'Jun 08, 2026 · 14:41', channel: 'in-app' },
]
