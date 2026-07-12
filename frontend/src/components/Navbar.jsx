import { Menu, Search, Moon, Sun, ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const TITLES = {
  '/': ['Dashboard', 'Live overview of usage across every connected model'],
  '/api-keys': ['API Keys', 'Manage the credentials TokenFlow uses to pull usage data'],
  '/analytics': ['Analytics', 'Drill into usage, cost, and request trends'],
  '/alerts': ['Alerts', 'Get notified before you hit your limits'],
}

export default function Navbar({ path, onMenuClick }) {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [title, subtitle] = TITLES[path] || TITLES['/']

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-surface/80 px-4 py-4 backdrop-blur-md sm:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-soft hover:bg-canvas lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-bold text-ink sm:text-xl">{title}</h1>
        <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>
      </div>

      <div className="hidden items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-muted md:flex">
        <Search size={15} />
        <span className="w-40">Search usage, keys…</span>
        <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </div>

      <button
        onClick={toggle}
        className="rounded-lg border border-border p-2 text-ink-soft transition-colors hover:bg-canvas"
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-xl border border-border py-1.5 pl-1.5 pr-2.5 hover:bg-canvas">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-teal-500 font-display text-xs font-bold text-white">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:block">{user?.email || 'User'}</span>
          <ChevronDown size={14} className="hidden text-muted sm:block" />
        </button>
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="rounded-lg border border-border p-2 text-ink-soft transition-colors hover:bg-canvas"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
