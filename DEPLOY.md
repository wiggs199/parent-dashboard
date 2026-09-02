# Deploying Parent Dashboard

Stack: **Neon** (Postgres) · **Render** (backend API) · **Cloudflare Pages** (frontend).
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

## 3. Frontend — Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the repo. Build settings:
   - **Root directory:** `parent-dashboard-frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Framework preset:** Vite (or None)
3. Environment variables:
   - `VITE_API_BASE_URL` → the Render URL from step 2 (no trailing slash)
4. Deploy. Note the URL: `https://parent-dashboard.pages.dev`.

SPA routing is handled by `public/_redirects` (already in the repo).

---

## 4. Connect the two

1. In Render → the API service → Environment, set
   `CORS_ORIGINS` = the Cloudflare Pages URL
   (e.g. `https://parent-dashboard.pages.dev`). Add your custom domain too,
   comma-separated, if you have one.
2. Save — Render redeploys.

---

## 5. Smoke test

On the live Cloudflare URL:

- [ ] Sign up with a real email → lands on the dashboard
- [ ] Add a child
- [ ] Add a log, reload the page — it's still there
- [ ] Log out and back in
- [ ] Open `/privacy` and `/terms` directly (tests the `_redirects` rule)

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

## Before inviting more than close friends

- Password reset flow (needs a transactional email service — Resend/Postmark)
- Rate limiting on `/auth/login` and `/auth/signup`
- Error monitoring (Sentry free tier)
- Have the Privacy Policy / Terms reviewed
- Move the Render instance off free (kills the cold start), consider Neon paid
  when you approach the free storage limit
