# Deploying AntAriPath

Stack: **Neon** (Postgres) · **Render** (backend API) · **Cloudflare Worker**
(frontend + custom domain) · **Cloudflare R2** (documents) · **Resend**
(email) · **Anthropic** (AI) · **Sentry** (errors). All deploy from the
GitHub repo except the frontend, which ships via the `wrangler` CLI. Running
cost: ~$7/mo (Render's Starter plan; everything else is free at this scale).

---

## 0. One-time prep

- [ ] Push this repo to GitHub (private is fine).
- [ ] In `parent-dashboard-frontend/src/siteConfig.js`, set the contact
      email and jurisdiction. These show on the public Privacy / Terms pages.

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
2. It picks up `render.yaml` and proposes the `parent-dashboard-api` service
   on the **Starter** plan (0.5 CPU / 512MB — comfortably enough for this
   workload; the free tier works too, but sleeps after 15min idle).
3. Fill in the env vars marked `sync: false` — at minimum `DATABASE_URL`
   (the Neon string from step 1). The rest (`CORS_ORIGINS`, R2, Resend,
   Anthropic, Sentry) can be added later as each is set up — the app
   degrades gracefully with each one unset (documents/email/AI/error
   monitoring just turn themselves off rather than erroring).
4. Create. First deploy runs `alembic upgrade head` then starts uvicorn.

**Option B — manual:** New → Web Service → repo → set Root Directory to
`parent-dashboard-backend`, Build `pip install -r requirements.txt`, Start
`alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
and add the same env vars plus `ENV=production`, `PYTHON_VERSION=3.12.8`.

When it's up, note the URL: `https://parent-dashboard-api.onrender.com`.
Check `https://…/health` returns `{"status":"ok"}`.

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
echo "VITE_API_BASE_URL=https://parent-dashboard-api.onrender.com" > .env.production
npm run build
npx wrangler deploy
```

`wrangler deploy` prints the URL (e.g. `https://parent-dashboard.<sub>.workers.dev`).
To ship a change later: `npm run build && npx wrangler deploy`.

### Custom domain

If the domain is already registered through Cloudflare (or added as a zone
there), add it to `wrangler.jsonc`:

```jsonc
"workers_dev": true,   // keep the *.workers.dev URL alive alongside it
"routes": [
  { "pattern": "yourdomain.com", "custom_domain": true },
  { "pattern": "www.yourdomain.com", "custom_domain": true }
]
```

`npx wrangler deploy` then provisions the route + TLS cert automatically —
no separate DNS record needed for a Worker custom domain.

---

## 4. Connect the two

1. In Render → the API service → Environment, set
   `CORS_ORIGINS` = comma-separated list of every origin the frontend is
   served from (the `.workers.dev` URL and the custom domain, if any).
   `FRONTEND_URL` = the canonical one (used to build links in emails).
2. Save — Render redeploys.

---

## 5. Documents — Cloudflare R2

1. Cloudflare dashboard → R2 → create a bucket.
2. R2 → Manage API Tokens → create a token with read/write access to it.
3. Render → Environment → set `R2_ENDPOINT`
   (`https://<account-id>.r2.cloudflarestorage.com`), `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

Unset in production, document upload returns a 503 rather than silently
writing to the (ephemeral) local disk. Unset in dev, uploads fall back to
a local `./uploads` folder automatically.

---

## 6. Email — Resend

1. resend.com → sign up → **Domains** → add your domain.
2. If the domain's on Cloudflare, Resend offers a one-click **Authorize**
   that writes the needed DNS records (SPF, DKIM, a bounce-handling MX on
   a `send.` subdomain) directly — otherwise copy them into Cloudflare's
   DNS tab manually. Verify once they propagate.
3. Render → Environment → set `RESEND_API_KEY` and `EMAIL_FROM` (e.g.
   `YourApp <hello@yourdomain.com>`).
4. Frontend: set `VITE_EMAIL_ENABLED=true` in `.env.production`, rebuild,
   redeploy. Until this is set, the frontend hides the email-dependent UI
   (verify banner, the forgot-password form) rather than promising a
   message it can't send.

Until a domain is verified, Resend's shared sender only delivers to the
account's own address — fine for solo testing, not for real signups.

---

## 7. AI — Anthropic

1. console.anthropic.com → sign up → add billing → **API Keys** → create one.
2. Worth setting a monthly spend cap under Settings → Limits — the calls
   here (a short summary, a document-field extraction) are inexpensive
   (fractions of a cent each), but a cap costs nothing and is cheap
   insurance.
3. Render → Environment → set `ANTHROPIC_API_KEY`.

Unset, both AI endpoints (`GET /logs/summary/:id`, `POST
/documents/:id/extract`) return a clean 503 rather than a fake or silent
result.

---

## 8. Error monitoring — Sentry

1. sentry.io → sign up → create **two projects**: one **Python (FastAPI)**,
   one **React**. Each gives a DSN (`https://…@…ingest.sentry.io/…`).
2. **Backend:** Render → Environment → add `SENTRY_DSN` = the Python DSN.
3. **Frontend:** put the React DSN in `parent-dashboard-frontend/.env.production`
   as `VITE_SENTRY_DSN=…`, then `npm run build && npx wrangler deploy`.

Configured for privacy: errors only (no tracing, no session replay),
`send_default_pii` off, request bodies / auth headers / query strings
scrubbed before an event is sent.

---

## 9. Smoke test

On the live domain:

- [ ] Sign up with a real email → lands on the dashboard, confirmation
      email arrives (if email is enabled)
- [ ] Add a child, add a log, reload — it's still there
- [ ] Upload a document, run AI extraction on it
- [ ] Generate an AI summary on the export/report page
- [ ] Log out and back in
- [ ] Open `/privacy` and `/terms` directly (SPA fallback)

---

## 10. Schema changes later

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

## Before wider (non friends-and-family) launch

- [x] Rate limiting on `/auth/*`
- [x] Error monitoring (Sentry)
- [x] Password reset / email verification (real email, once a domain's set up)
- [x] Move Render off the free tier (kills the cold-start delay)
- [ ] Have the Privacy Policy / Terms reviewed
