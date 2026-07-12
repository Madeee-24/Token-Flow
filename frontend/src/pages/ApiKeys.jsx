import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ChartCard from '../components/ChartCard'
import ProviderBadge from '../components/ProviderBadge'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { TableSkeleton, EmptyState, ErrorState } from '../components/States'
import { getApiKeys, createApiKey, deleteApiKey } from '../services/api'

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
]

const STATUS_STYLE = {
  active: 'bg-teal-50 text-teal-600',
  revoked: 'bg-rose-50 text-rose-600',
}

function maskKey(raw) {
  if (raw.length <= 8) return raw
  return `${raw.slice(0, 6)}${'•'.repeat(8)}${raw.slice(-4)}`
}

export default function ApiKeys() {
  const [state, setState] = useState({ loading: true, error: false })
  const [keys, setKeys] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ provider: 'openai', label: '', apiKey: '' })
  const [formError, setFormError] = useState('')

  async function load() {
    setState({ loading: true, error: false })
    try {
      const data = await getApiKeys()
      setKeys(data)
      setState({ loading: false, error: false })
    } catch {
      setState({ loading: false, error: true })
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim() || !form.apiKey.trim()) {
      setFormError('Fill in both the project label and the API key.')
      return
    }
    setFormError('')
    setSaving(true)
    try {
      const record = await createApiKey({
        provider: form.provider,
        label: form.label.trim(),
        api_key: form.apiKey.trim(),
      })
      setKeys((prev) => [record, ...prev])
      setForm({ provider: 'openai', label: '', apiKey: '' })
      setModalOpen(false)
      window.dispatchEvent(new Event('tokenflow:key-updated'))
    } catch {
      setFormError('Could not save this key. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const prev = keys
    setKeys((k) => k.filter((item) => item.id !== id))
    try {
      await deleteApiKey(id)
    } catch {
      setKeys(prev)
    }
  }

  const columns = [
    { key: 'provider', header: 'Provider', render: (r) => <ProviderBadge provider={r.provider} size="sm" /> },
    { key: 'label', header: 'Label / Project', render: (r) => <span className="font-medium text-ink">{r.label}</span> },
    { key: 'keyMasked', header: 'API Key', render: (r) => <code className="text-xs">{r.keyMasked}</code> },
    { key: 'createdAt', header: 'Added' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button
          onClick={() => handleDelete(r.id)}
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-50 hover:text-rose-500"
          aria-label={`Remove key ${r.label}`}
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <ChartCard
        title="Saved API keys"
        subtitle="TokenFlow uses these to pull usage data from each provider"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <Plus size={16} /> Add API key
          </button>
        }
      >
        {state.loading ? (
          <TableSkeleton rows={3} />
        ) : state.error ? (
          <ErrorState onRetry={load} />
        ) : keys.length === 0 ? (
          <EmptyState
            title="No API keys yet"
            message="Add a provider key so TokenFlow can start tracking usage."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                <Plus size={13} /> Add your first key
              </button>
            }
          />
        ) : (
          <DataTable columns={columns} rows={keys} />
        )}
      </ChartCard>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add API key">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">API provider</label>
            <select
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Label / project name</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Production — Web App"
              className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-soft">API key</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              placeholder="sk-••••••••••••••••"
              className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 font-mono text-sm text-ink placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-1.5 text-[11px] text-muted">Keys are masked immediately and never shown in full again.</p>
          </div>

          {formError && <p className="text-xs font-medium text-rose-500">{formError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save key'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
