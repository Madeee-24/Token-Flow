import axios from 'axios'
import {
  usageSummary,
  dailyUsage,
  modelUsage,
  costBreakdown,
  requestFrequency,
  recentActivity,
  initialApiKeys,
} from '../data/mockData'

const rawApiBaseUrl = import.meta.env.VITE_API_URL || ''
const API_BASE_URL = rawApiBaseUrl ? `${rawApiBaseUrl.replace(/\/$/, '')}/api/v1` : '/api/v1'

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const DEMO_MODE = import.meta.env.VITE_USE_DEMO_DATA === 'true'
const demoDelay = (data, ms = 550) =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), ms))

function normalizeUsageSummary(payload) {
  const totalTokens = payload.total_tokens ?? payload.totalTokens ?? 0
  const tokenLimit = payload.token_limit ?? payload.tokenLimit ?? 0
  const usagePercentage = payload.usage_percentage ?? payload.usagePercent ?? payload.usage_percent ?? (tokenLimit ? (totalTokens / tokenLimit) * 100 : 0)
  const totalCost = payload.total_cost ?? payload.totalCost ?? payload.cost ?? 0
  const totalRequests = payload.total_requests ?? payload.totalRequests ?? 0

  return {
    totalTokens,
    tokenLimit,
    usagePercentage,
    totalCost,
    totalRequests,
    tokensTrend: payload.tokens_trend ?? payload.tokensTrend ?? 0,
    costTrend: payload.cost_trend ?? payload.costTrend ?? 0,
    requestsTrend: payload.requests_trend ?? payload.requestsTrend ?? 0,
  }
}

function normalizeApiKey(record) {
  return {
    id: record.id,
    provider: record.provider,
    label: record.label,
    keyMasked: record.key_masked ?? record.keyMasked ?? record.label,
    status: record.is_active ? 'active' : 'revoked',
    createdAt: record.created_at ? record.created_at.slice(0, 10) : record.createdAt,
  }
}

async function runWithFallback(request, fallbackData, fallbackDelay = 550) {
  if (DEMO_MODE) return (await demoDelay(fallbackData, fallbackDelay)).data

  try {
    const { data } = await request()
    return data
  } catch (error) {
    console.warn('Falling back to demo data because the live API request failed:', error)
    return (await demoDelay(fallbackData, fallbackDelay)).data
  }
}

export async function getUsageSummary() {
  const data = await runWithFallback(() => client.get('/usage'), usageSummary)
  return normalizeUsageSummary(data)
}

export async function getDailyUsage() {
  return runWithFallback(() => client.get('/usage/daily'), dailyUsage)
}

export async function getModelUsage() {
  return runWithFallback(() => client.get('/usage/models'), modelUsage)
}

export async function getRecentActivity() {
  return runWithFallback(() => client.get('/usage/activity'), recentActivity)
}

export async function getAnalytics(params) {
  return runWithFallback(
    () => client.get('/analytics', { params }),
    {
      dailyUsage,
      costBreakdown,
      requestFrequency,
      modelUsage,
    },
  )
}

export async function getApiKeys() {
  const data = await runWithFallback(() => client.get('/keys'), initialApiKeys)
  return Array.isArray(data) ? data.map(normalizeApiKey) : []
}

export async function createApiKey(payload) {
  const backendPayload = {
    provider: payload.provider,
    label: payload.label?.trim() || 'My Key',
    api_key: payload.api_key || payload.apiKey || payload.key || '',
  }

  if (DEMO_MODE) {
    const record = {
      id: `k${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      ...payload,
    }
    return (await demoDelay(record, 400)).data
  }

  try {
    const { data } = await client.post('/keys', backendPayload)
    return normalizeApiKey(data)
  } catch (error) {
    console.warn('Falling back to demo data because the live API request failed:', error)
    const record = {
      id: `k${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      ...payload,
    }
    return (await demoDelay(record, 400)).data
  }
}

export async function deleteApiKey(id) {
  const result = await runWithFallback(() => client.delete(`/keys/${id}`), { id }, 300)
  return result
}

export async function loginUser(payload) {
  const { data } = await client.post('/auth/login', payload)
  return data
}

export async function signupUser(payload) {
  const { data } = await client.post('/auth/signup', payload)
  return data
}

export async function getCurrentUser() {
  const { data } = await client.get('/auth/me')
  return data
}

export { DEMO_MODE }
