# Parent Dashboard

A calm, simple dashboard for parents of children with speech, learning, or
developmental needs to organize what they're already doing — therapy
exercises, exploration activities, progress notes, and documents — in one
place.

It is an **organizational support tool**. Not therapy, coaching, diagnosis,
or progress evaluation.

## Layout

| Folder | Stack | Notes |
|---|---|---|
| `parent-dashboard-backend/` | FastAPI + SQLAlchemy + Alembic | JWT auth, per-parent scoping. SQLite locally, Postgres in prod. See its README. |
| `parent-dashboard-frontend/` | React 19 + Vite + Tailwind v4 | Talks to the API; real auth. See its README. |

## Running locally

Two terminals:

```bash
# 1 — backend
cd parent-dashboard-backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 2 — frontend
cd parent-dashboard-frontend
npm install
npm run dev        # http://localhost:5173
```

## Deploy

[`DEPLOY.md`](DEPLOY.md) — Neon (Postgres) + Render (API) + Cloudflare Pages
(frontend). $0 to launch.

## Status

- [x] Backend foundation (routers mount, CORS, deps pinned)
- [x] Parent model + JWT auth + per-parent scoping, with tests
- [x] Frontend wired to the API (real auth, real data)
- [x] Calm/warm design system + sidebar layout
- [x] Postgres + Alembic migrations; deploy config; Privacy / Terms pages
- [ ] Document upload / timeline / CSV-PDF export UI
- [ ] AI summaries (read-only, observational)
- [ ] Password reset, rate limiting, error monitoring (before wide launch)
