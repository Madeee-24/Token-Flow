import { PROVIDERS } from '../data/mockData'

const DOT_CLASS = {
  openai: 'bg-openai',
  claude: 'bg-claude',
  gemini: 'bg-gemini',
}

export default function ProviderBadge({ provider, size = 'md' }) {
  const meta = PROVIDERS.find((p) => p.id === provider) || { label: provider }
  const dims = size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-7 w-7 text-xs'

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${dims} shrink-0 rounded-full flex items-center justify-center font-display font-bold text-white ${DOT_CLASS[provider] || 'bg-muted'}`}
      >
        {meta.label.charAt(0)}
      </span>
      <span className="text-sm text-ink-soft">{meta.label}</span>
    </span>
  )
}
