# Parent Dashboard — Backend

FastAPI + SQLAlchemy + SQLite. JWT auth; every resource is scoped to the
logged-in parent.

## Setup

```bash
cd parent-dashboard-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt   # or requirements.txt for runtime only
cp .env.example .env                  # optional for local dev; see below
```

`.env` is optional locally — the app falls back to an insecure dev secret.
It is **required** in any non-dev environment (`ENV != development`), where
startup aborts if `SECRET_KEY` is still the default.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

The SQLite file `db.sqlite3` is created on first run and is gitignored.
There are no migrations yet: if you change a model, delete `db.sqlite3` and
let it recreate.

## Test

```bash
pytest
```

Tests use a throwaway SQLite file per test and never touch `db.sqlite3` or
`uploads/`.

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
