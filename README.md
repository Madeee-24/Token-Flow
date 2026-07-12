# TokenFlow

A clean, responsive dashboard for monitoring API usage across LLM providers
(OpenAI, Claude, Gemini) — token consumption, cost, requests, and alerts.

## Tech stack

- React 19 + Vite
- Tailwind CSS v4
- Recharts for charts
- Axios for API calls
- React Router for navigation
- lucide-react for icons

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Demo mode vs. a real backend

The app ships in **demo mode**: `src/services/api.js` returns the bundled
sample dataset (`src/data/mockData.js`) with a short simulated delay, so
every page is fully explorable with no backend running.

To connect a real API, copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=https://your-backend.com
```

Once set, `src/services/api.js` switches to real Axios calls against:

| Method | Endpoint          | Used by                          |
| ------ | ----------------- | --------------------------------- |
| GET    | `/usage`           | Dashboard summary cards           |
| GET    | `/usage/daily`     | Dashboard line chart              |
| GET    | `/usage/models`    | Dashboard bar chart               |
| GET    | `/usage/activity`  | Dashboard recent activity list    |
| GET    | `/analytics`       | Analytics page (accepts `range`, `provider` query params) |
| GET    | `/keys`            | API Keys page                     |
| POST   | `/keys`            | Add API key form                  |
| DELETE | `/keys/:id`        | Remove API key                    |

Response shapes match the objects exported from `src/data/mockData.js`, so
swapping in a real backend is a drop-in change.

## Project structure

```
src/
  components/       Reusable UI: Sidebar, Navbar, StatCard, ChartCard,
                     DataTable, Modal, ThresholdToggle, ProviderBadge,
                     States (loading/empty/error)
  components/charts/ TokenLineChart, ModelBarChart, CostPieChart
  pages/            Dashboard, ApiKeys, Analytics, Alerts
  context/          ThemeContext (light/dark mode)
  services/         api.js — Axios layer with demo-mode fallback
  data/             mockData.js — sample dataset / API response shapes
```

## Design notes

- Light theme, soft-gray canvas, white cards, rounded-2xl corners, soft
  shadows — per the SaaS-dashboard brief.
- A deep-ink sidebar gives the app a wayfinding anchor without breaking the
  overall light theme.
- The "flow" motif (an animated gradient line) marks the active nav item and
  the quota bar, tying back to the product name. It respects
  `prefers-reduced-motion`.
- Provider colors (OpenAI green, Claude clay, Gemini blue) are used only as
  small identifying accents (badges, chart series) so charts stay legible at
  a glance.
- Dark mode is a class-based toggle (`useTheme` in `ThemeContext`); all
  colors are CSS variables so both themes stay in sync.

## Responsive behavior

- Sidebar collapses to an off-canvas drawer below `lg` breakpoint, toggled
  from the navbar.
- Summary cards, charts, and tables reflow to single-column on mobile.
