# Deploying Parent Dashboard

Stack: **Neon** (Postgres) · **Render** (backend API) · **Cloudflare** (frontend).
All three deploy from the GitHub repo. Cost to launch: $0.

---

## 0. One-time prep

- [ ] Push this repo to GitHub (private is fine).
- [ ] In `parent-dashboard-frontend/src/siteConfig.js`, replace the
      `REPLACE_WITH_…` placeholders (contact email, jurisdiction). These show
      on the public Privacy / Terms pages.

---

## 1. Database — Neon

1. Create an account at neon.tech, create a project (pick a US region).
2. Copy the **connection string** (looks like
   `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).
   Use the pooled connection string if offered.
3. Keep it handy for step 2.

Nothing to configure — the app creates its own tables via migrations.

---

## 2. Backend — Render

**Option A — Blueprint (uses `render.yaml`):**

1. Render dashboard → **New → Blueprint** → connect the repo.
2. It picks up `render.yaml` and proposes the `parent-dashboard-api` service.
3. Fill in the env vars it asks for:
   - `DATABASE_URL` → the Neon connection string from step 1
   - `CORS_ORIGINS` → leave blank for now, set in step 4
   - `SECRET_KEY` → Render generates this automatically
4. Create. First deploy runs `alembic upgrade head` then starts uvicorn.

**Option B — manual:** New → Web Service → repo → set Root Directory to
`parent-dashboard-backend`, Build `pip install -r requirements.txt`, Start
`alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
and add the same env vars plus `ENV=production`, `PYTHON_VERSION=3.12.8`.

When it's up, note the URL: `https://parent-dashboard-api.onrender.com`.
Check `https://…/health` returns `{"status":"ok"}`.

> Free instances sleep after 15 min idle — the first request then takes
> ~30–60s. Upgrade to the $7/mo instance to remove that.

---

## 3. Frontend — Cloudflare (Workers static assets, deployed via CLI)

Cloudflare's Git integration kept deploying the raw source instead of the
Vite build, so the frontend deploys from the command line with `wrangler`.
Config lives in `parent-dashboard-frontend/wrangler.jsonc` (serves `./dist`
with SPA fallback — no `_redirects` file, that's Pages-only).

```bash
cd parent-dashboard-frontend
npx wrangler login          # one-time, opens a browser
# set the API URL for the build:
echo "VITE_API_BASE_URL=https://parent-dashboard-api.onrender.com" > .env
npm run build
npx wrangler deploy
```

`wrangler deploy` prints the URL (e.g. `https://parent-dashboard.<sub>.workers.dev`).

To ship a change later: `npm run build && npx wrangler deploy`.
(Reconnecting push-to-deploy via the dashboard is a later nicety.)

---

## 4. Connect the two

1. In Render → the API service → Environment, set
   `CORS_ORIGINS` = the Cloudflare Worker URL
   (e.g. `https://parent-dashboard.<sub>.workers.dev`). Add your custom domain too,
   comma-separated, if you have one.
2. Save — Render redeploys.

---

## 5. Smoke test

On the live Cloudflare URL:

- [ ] Sign up with a real email → lands on the dashboard
- [ ] Add a child
- [ ] Add a log, reload the page — it's still there
- [ ] Log out and back in
- [ ] Open `/privacy` and `/terms` directly (SPA fallback)

---

## 6. Schema changes later

The database is managed by Alembic. When you change a model:

```bash
cd parent-dashboard-backend && source venv/bin/activate
alembic revision --autogenerate -m "what changed"
# review the generated file in alembic/versions/, then:
alembic upgrade head            # applies locally
```

Commit the new file in `alembic/versions/`. Render runs `alembic upgrade head`
on every deploy, so pushing is all that's needed in production. The
`test_migrations.py` test fails if a model change has no migration.

---

## Error monitoring — Sentry

Wired in (backend + frontend); dormant until the DSNs are set.

1. sentry.io → sign up → create **two projects**: one **Python (FastAPI)**,
   one **React**. Each gives a DSN (`https://…@…ingest.sentry.io/…`).
2. **Backend:** Render → `parent-dashboard-api` → Environment → add
   `SENTRY_DSN` = the Python DSN. Save (redeploys).
3. **Frontend:** put the React DSN in `parent-dashboard-frontend/.env.production`
   as `VITE_SENTRY_DSN=…`, then `npm run build && npx wrangler deploy`.
4. **Verify:** while logged in, hit
   `https://parent-dashboard-api.onrender.com/debug/sentry-test` — a
   deliberate 500 that should appear in Sentry within a minute.

Configured for privacy: errors only (no tracing, no session replay),
`send_default_pii` off, request bodies / auth headers / query strings
scrubbed before an event is sent.

## Before inviting more than close friends

- Password reset flow (needs a transactional email service — Resend/Postmark)
- ~~Rate limiting on `/auth/*`~~ (done)
- ~~Error monitoring~~ (wired — set the DSNs, above)
- Have the Privacy Policy / Terms reviewed
- Move the Render instance off free (kills the cold start), consider Neon paid
  when you approach the free storage limit
