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
| `parent-dashboard-backend/` | FastAPI + SQLAlchemy + SQLite | JWT auth, per-parent scoping. See its README. |
| `parent-dashboard-frontend/` | React 19 + Vite + Tailwind | Currently runs on placeholder data; being wired to the API next. |

## Running locally

Two terminals:

```bash
# 1 — backend
cd parent-dashboard-backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# 2 — frontend
cd parent-dashboard-frontend
npm install
npm run dev        # http://localhost:5173
```

## Status

- [x] Backend foundation fixed (routers actually mount, CORS, deps pinned)
- [x] Parent model + JWT auth + per-parent scoping, with tests
- [ ] Frontend wired to the API (real auth, real data)
- [ ] Document upload / timeline / CSV-PDF export UI
- [ ] AI summaries (read-only, observational)
- [ ] Move SQLite → Postgres before real users
