# AntAriPath — Frontend

React 19 + Vite + Tailwind v4. Talks to the FastAPI backend.

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
`src/auth/AuthContext.jsx` and is read with the `useAuth()` hook.

## Design system — "Northlight"

The palette and fonts are Tailwind v4 `@theme` tokens at the top of
`src/index.css` — change those values to retune the whole app. Token
utilities: `bg-paper` / `bg-surface` / `bg-surface-sunk`, `text-ink` /
`text-ink-soft` / `text-ink-faint`, `pine` / `pine-dark` / `pine-soft`
(primary accent), `persimmon` / `persimmon-dark` / `persimmon-soft`
(second accent, used sparingly), `gold` (mood/small highlights),
`border-line` / `border-line-strong`. Fraunces (display serif, `.font-display`)
for headings, Hanken Grotesk for everything else. Full light/dark mode —
`src/lib/theme.js` plus a pre-paint script in `index.html` to avoid a flash.

Shared UI primitives live in `src/components/ui.jsx` (`Card`, `Button`,
`TextInput`, `PasswordInput`, `Select`, `Textarea`, `Field`, `Alert`,
`EmptyState`). Every app page is framed with `PageHeader`; auth pages with
`AuthShell` (+ `AuthIllustration`, `NovaMark`). Layout is `Sidebar` + a
centered column in `AppLayout`.

## Where things are

| Path | What |
|---|---|
| `src/api/client.js` | axios instance + interceptors + `errorMessage()` |
| `src/api/resources.js` | typed calls for children / logs / documents / AI summary / extraction |
| `src/auth/` | token storage, context, provider |
| `src/components/ui.jsx` | shared visual primitives |
| `src/components/Sidebar,AppLayout,PageHeader,AuthShell` | layout + framing |
| `src/pages/Login,Signup,ForgotPassword,ResetPassword,VerifyEmail` | real auth flows |
| `src/pages/Dashboard` | greeting, usage stats, child cards |
| `src/pages/ChildProfile` | a child's profile — focus areas, notes, birth year |
| `src/pages/Logs` | pick a child, timeline view, add/edit/delete a log entry |
| `src/pages/Documents` | upload/list/download/delete per child, with on-demand AI extraction |
| `src/pages/ExportView` | the print/PDF report — range presets, type filters, summary, on-demand AI summary |
| `src/pages/About,Privacy,Terms` | public/legal pages |

`src/pages/AISummary.jsx` (route `/ai-summary`) is an older placeholder
page, not linked from the sidebar nav — the real AI summary now lives
inside `ExportView`. Worth removing or repurposing rather than leaving it
orphaned.
