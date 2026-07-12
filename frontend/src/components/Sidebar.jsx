import { NavLink } from 'react-router-dom'
import { LayoutGrid, KeyRound, LineChart, BellRing, Zap, X } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/api-keys', label: 'API Keys', icon: KeyRound },
  { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#14171F] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-teal-500">
              <Zap size={16} strokeWidth={2.5} className="text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">TokenFlow</span>
          </div>
          <button className="text-white/60 lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/25 via-brand-500/10 to-transparent" />
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-400 via-teal-400 to-brand-400 animate-flow" />
                  )}
                  <Icon size={18} strokeWidth={2} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-4 mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/70">Monthly quota</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-brand-400 via-teal-400 to-brand-400 animate-flow" />
          </div>
          <p className="mt-2 text-[11px] text-white/45">70% of 12M tokens used</p>
        </div>
      </aside>
    </>
  )
}
