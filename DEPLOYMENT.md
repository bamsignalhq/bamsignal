# Deployment

BamSignal deploys as a **single Docker container** serving the Vite-built SPA and Express API. Production runs on **Coolify** at [control.bamsignal.com](https://control.bamsignal.com).

**Production URL:** https://bamsignal.com  
**Do not use Vercel** — `.vercel/` is legacy.

---

## Architecture

```
GitHub main → Coolify webhook → Docker build (Dockerfile) → Container :3000
                                      │
                                      ├─ builder: npm run build + test:source-integrity
                                      └─ runner: node server/production.js
```

---

## Prerequisites

1. Postgres `DATABASE_URL` (Supabase recommended).
2. Coolify host with Docker.
3. DNS `bamsignal.com` → Coolify server.
4. Secrets from `.env.example` in Coolify runtime env.

---

## Build-time variables (Coolify: Buildtime ON)

Public `VITE_*` only — embedded in client bundle:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_FIREBASE_* (optional push)
VITE_PUBLIC_APP_URL
VITE_PAYSTACK_PUBLIC_KEY
VITE_ENABLE_IMAGE_MODERATION
```

See `Dockerfile` builder `ARG` list.

**Never** pass runtime secrets as Docker build args.

---

## Runtime variables (Coolify: Buildtime OFF)

Injected at container start:

```
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
PAYSTACK_SECRET_KEY
RESEND_API_KEY
SENDCHAMP_*
FIREBASE_SERVICE_ACCOUNT_JSON
CRON_SECRET
COMMAND_CENTER_PIN
```

Full list: `.env.example`

---

## Deploy steps

### Standard deploy (code change)

1. Run locally before push:
   ```bash
   npm run build
   npm run test:server-import
   npm run test          # certification suite (73 scripts)
   ```
2. Commit to `main` on `github.com/bamsignalhq/bamsignal`.
3. Coolify rebuilds from `Dockerfile` automatically (webhook).
4. Confirm build logs: `npm run build` succeeds, `smoke-server-import.mjs` passes in image.
5. Verify health:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/health    # 200
   curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/ready     # 200 when deps OK
   ```
6. If webhook missed: manual redeploy in Coolify UI.

### Database migration

```bash
# Against production DATABASE_URL (from secure shell, not committed)
npm run migrate
npm run verify:database
```

Run migrations **before** or **immediately after** deploy when schema changed.

### Android release (separate track)

```bash
npm run build
npx cap sync android
npm run android:verify-assets
npm run android:release
```

Never upload stale AAB — verify `dist/` matches synced assets.

---

## Health checks

| Endpoint | Docker | Meaning |
|----------|--------|---------|
| `GET /health` | Optional liveness | Process up |
| `GET /ready` | `HEALTHCHECK` in Dockerfile | DB + Paystack + signup email + photo storage |

`/ready` returns **503** until critical dependencies configured.  
Detailed payload: `GET /ready?details=1` with `x-diagnostics-secret`.

---

## Rollback steps

### Application rollback

1. Coolify → BamSignal → **Deployments** → select last good deployment → **Redeploy**.
2. Or git revert:
   ```bash
   git revert <bad-sha>
   git push origin main
   ```
3. Confirm logs: `[bamsignal] Running on http://0.0.0.0:3000`
4. Verify `/ready` → 200.

There is **no separate image registry** — rollback = older git SHA rebuild.

### Environment rollback

1. Coolify → Environment variables → restore previous values from password manager history.
2. Restart container.
3. Check `/ready?details=1` for dependency flags.

See [RUNBOOK.md](./RUNBOOK.md) and `docs/runbooks/deployment-recovery.md`.

---

## Common failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| `/ready` 503 | Missing `DATABASE_URL` or Paystack secret | Set runtime env |
| `signupEmail=false` | Missing Resend + Supabase service role | See `.env.example` |
| Stale UI after deploy | Old service worker cache | `CACHE_VERSION` bump in build |
| Build fails tsc | Type errors | `npm run lint` locally |
| Webhook 401 Paystack | Wrong `PAYSTACK_WEBHOOK_SECRET` | Rotate in Paystack dashboard |

---

## Related documents

- [RUNBOOK.md](./RUNBOOK.md)
- [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md)
- [MONITORING.md](./MONITORING.md)
- [SECURITY.md](./SECURITY.md)
