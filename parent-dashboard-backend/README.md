# Parent Dashboard — Backend

FastAPI + SQLAlchemy. JWT auth; every resource is scoped to the logged-in
parent. SQLite locally, Postgres in production (`DATABASE_URL`).

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

Tests use a throwaway SQLite file per test and never touch `db.sqlite3` or
`uploads/`.

## Deploy

See [`../DEPLOY.md`](../DEPLOY.md) — Neon + Render + Cloudflare Pages.

## API shape

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/signup` | – | `{email, password, name?}` → `{access_token}` |
| POST | `/auth/login` | – | form body `username` (=email) + `password` |
| GET | `/auth/me` | ✓ | current parent |
| GET/POST | `/children` | ✓ | list / create; scoped to parent |
| GET | `/children/{id}` | ✓ | 404 if not owned |
| POST | `/logs` | ✓ | body includes `child_id`; 404 if child not owned |
| GET | `/logs/child/{child_id}` | ✓ | |
| GET | `/logs/summary/{child_id}` | ✓ | placeholder text (AI comes later) |
| POST | `/documents?child_id=&type=` | ✓ | multipart `file` |
| GET | `/documents/child/{child_id}` | ✓ | |
| POST | `/explorationtips` | ✓ | body includes `child_id` |
| GET | `/explorationtips/child/{child_id}` | ✓ | |
