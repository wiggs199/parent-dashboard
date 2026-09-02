# Parent Dashboard — Frontend

React 19 + Vite + Tailwind. Talks to the FastAPI backend.

## Setup

```bash
cd parent-dashboard-frontend
npm install
```

`.env` sets the API base URL (defaults to `http://localhost:8000`):

```
VITE_API_BASE_URL=http://localhost:8000
```

## Run

```bash
npm run dev      # http://localhost:5173
```

The backend must be running (see `../parent-dashboard-backend/README.md`).

```bash
npm run build    # production bundle in dist/
npm run lint
```

## Auth

The JWT from `/auth/login` or `/auth/signup` is kept in `localStorage`
(`pd_token`). `src/api/client.js` attaches it to every request and, on a
401, clears it and redirects to `/login`. Auth state lives in
`src/auth/AuthProvider.jsx` and is read with the `useAuth()` hook.

## Design system

The palette and fonts are Tailwind v4 `@theme` tokens at the top of
`src/index.css` — change those ~12 values to retune the whole app. Token
utilities: `bg-canvas` / `bg-surface` / `bg-surface-sunk`, `text-ink` /
`text-ink-soft` / `text-ink-faint`, `sage` / `sage-dark` / `sage-soft`
(accent), `clay` / `clay-soft` (sparingly), `border-line` /
`border-line-strong`.

Shared UI primitives live in `src/components/ui.jsx` (`Card`, `Button`,
`TextInput`, `Select`, `Textarea`, `Field`, `Alert`, `EmptyState`).
Every app page is framed with `PageHeader`; auth pages with `AuthShell`.
Layout is `Sidebar` + a centered `max-w-4xl` column in `AppLayout`.

## Where things are

| Path | What |
|---|---|
| `src/api/client.js` | axios instance + interceptors + `errorMessage()` |
| `src/api/resources.js` | typed calls for children / logs / documents / tips |
| `src/auth/` | token storage, context, provider |
| `src/components/ui.jsx` | shared visual primitives |
| `src/components/Sidebar,AppLayout,PageHeader,AuthShell` | layout + framing |
| `src/pages/Login,Signup` | real auth forms |
| `src/pages/Dashboard` | list + add children (live) |
| `src/pages/Logs` | pick a child, view + add logs (live) — timeline |
| `src/pages/Documents,AISummary` | framed "coming soon" screens |
