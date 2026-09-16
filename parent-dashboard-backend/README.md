# AntAriPath — Backend

FastAPI + SQLAlchemy. JWT auth; every resource is scoped to the logged-in
parent. SQLite locally, Postgres (Neon) in production (`DATABASE_URL`).

## Setup

```bash
cd parent-dashboard-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt   # or requirements.txt for runtime only
cp .env.example .env                  # optional for local dev; see below
alembic upgrade head                  # create the tables
```

`.env` is optional locally — the app falls back to an insecure dev secret
and a local SQLite file. It is **required** once `ENV != development`, where
startup aborts unless both `SECRET_KEY` and `DATABASE_URL` are set.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Database & migrations

Schema is managed by **Alembic** — there is no `create_all`. `db.sqlite3`
(gitignored) is created by `alembic upgrade head`. When you change a model:

```bash
alembic revision --autogenerate -m "what changed"
# review alembic/versions/<new file>, then
alembic upgrade head
```

Commit the new file under `alembic/versions/`. `tests/test_migrations.py`
fails if a model change has no matching migration. In production Render runs
`alembic upgrade head` on every deploy.

## Test

```bash
pytest
```

44 tests. Uses a throwaway SQLite file per test and never touches
`db.sqlite3` or `uploads/`. `ANTHROPIC_API_KEY` is unset in tests by
design — the AI endpoints assert a clean 503 rather than calling out to
a real model.

## Deploy

See [`../DEPLOY.md`](../DEPLOY.md) — Neon + Render + Cloudflare + R2 +
Resend + Anthropic + Sentry.

## Admin scripts

One-time: create `.env.prod` (gitignored) with the live DB URL from
Render → the API service → Environment:

```
DATABASE_URL=postgresql://…neon.tech/neondb?sslmode=require
```

Then:

```bash
cd parent-dashboard-backend
venv/bin/python scripts/stats.py                       # usage counts, recent signups + logs
venv/bin/python scripts/reset_password.py user@x.com   # unlock a locked-out trial user
```

`.env.prod` is read only by these scripts — local `uvicorn` still uses SQLite.

## API shape

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/signup` | – | `{email, password, name?}` → `{access_token}`; rate limited, queues a welcome email |
| POST | `/auth/login` | – | form body `username` (=email) + `password`; rate limited |
| GET | `/auth/me` | ✓ | current parent |
| GET | `/auth/stats` | ✓ | children/logs-this-week/documents counts, per-child breakdown |
| POST | `/auth/verify-email` \| `/auth/resend-verification` | ✓ | email verification |
| POST | `/auth/forgot-password` \| `/auth/reset-password` | – | password reset; rate limited; never leaks whether an email exists |
| GET/POST | `/children` | ✓ | list / create |
| GET/PATCH/DELETE | `/children/{id}` | ✓ | 404 (not 403) if not owned; delete cascades |
| POST | `/logs` | ✓ | body includes `child_id`; 404 if child not owned |
| GET | `/logs/child/{child_id}` | ✓ | |
| PATCH/DELETE | `/logs/{id}` | ✓ | |
| GET | `/logs/summary/{child_id}` | ✓ | AI-generated summary of the filtered entries (`?from=&to=&types=`); 503 if `ANTHROPIC_API_KEY` unset |
| POST | `/documents` | ✓ | multipart `file`; 503 in production without R2 configured |
| GET | `/documents/child/{child_id}` | ✓ | |
| PATCH/DELETE | `/documents/{id}` | ✓ | |
| GET | `/documents/{id}/download` | ✓ | streamed from R2 (or local `./uploads` in dev) |
| POST | `/documents/{id}/extract` | ✓ | AI field extraction from the document itself; 503 unconfigured, 422 unreadable file type |
| POST/GET | `/explorationtips`, `/explorationtips/child/{child_id}` | ✓ | free-text notes attached to a log entry |
