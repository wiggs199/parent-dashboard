# AntAriPath

A calm, simple place for a parent or caregiver to organize their child's
care record — home practice, appointments, observations, and documents
(IEPs, insurance letters, therapist reports) — and turn it into a clean
summary whenever a school, therapist, or insurer needs one.

It is an **organizational support tool**. Not therapy, coaching, diagnosis,
or progress evaluation — it never scores, assesses, or judges progress. It
organizes what the parent already knows.

**Live:** [antaripath.com](https://antaripath.com)

## What's built

- **Auth** — signup/login/logout, JWT, per-parent data scoping (a parent can
  never see another parent's data — 404, not 403, so ids don't leak), email
  verification + password reset (real transactional email via Resend),
  rate limiting on all auth endpoints.
- **Children & logs** — child profiles (birth year, focus areas, notes);
  five log types (home practice, activity, appointment, observation,
  milestone), a 5-face mood picker, optional time-of-day, full edit/delete.
- **Documents** — upload and store per child (Cloudflare R2), with an
  **AI-powered extraction** step: Claude reads an uploaded IEP or insurance
  letter directly (native PDF/image input) and pulls out the literal fields
  — goals, dates, authorized sessions — on demand, never automatically.
- **Reports** — a print/PDF export with date-range presets, per-type
  filters, a stats summary, and an **on-demand AI-generated summary**
  (Claude Sonnet 5) describing patterns in the logged entries in plain
  language. Both AI features are guardrailed in the prompt itself: describe
  only what's literally there, never score/assess/diagnose/advise.
- **Design system** ("Northlight") — Tailwind v4 tokens, Fraunces + Hanken
  Grotesk, full light/dark mode.
- **Observability** — Sentry on both ends (errors only, PII scrubbed, no
  tracing/replay).

## Layout

| Folder | Stack | Notes |
|---|---|---|
| `parent-dashboard-backend/` | FastAPI + SQLAlchemy + Alembic | JWT auth, per-parent scoping. SQLite locally, Postgres (Neon) in prod. See its README. |
| `parent-dashboard-frontend/` | React 19 + Vite + Tailwind v4 | Talks to the API; real auth. See its README. |

(Folder names predate the product's current name — a rename would touch
every deploy config, so they stayed as `parent-dashboard-*`.)

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

[`DEPLOY.md`](DEPLOY.md) — Neon (Postgres) + Render (API) + Cloudflare
Worker (frontend, static assets + custom domain) + R2 (documents) +
Resend (email) + Anthropic (AI) + Sentry (errors). Runs at ~$7/mo total.
