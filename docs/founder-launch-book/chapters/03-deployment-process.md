# Deployment Process

Standard path: **push to `main` → Coolify webhook rebuild → verify health.**

## Pre-push checklist (local)

```bash
npm run build
npm run test:server-import
npm run test                    # full certification suite
```

Optional before major releases:

```bash
npm run certify:rc
npm run smoke:production
npm run certify:e2e             # requires DATABASE_URL + DIAGNOSTICS_SECRET
```

## Deploy steps

1. Commit to `main` on `github.com/bamsignalhq/bamsignal`.
2. Coolify rebuilds from `Dockerfile` (webhook). Confirm build logs show:
   - `npm run build` success
   - `test:source-integrity` pass in builder stage
3. Container starts `node server/production.js`.
4. Verify post-deploy:

```bash
curl -s https://bamsignal.com/health
curl -s -o /dev/null -w "%{http_code}\n" https://bamsignal.com/ready
npm run smoke:production
```

5. If webhook missed: **manual redeploy** in Coolify UI.

## Build-time vs runtime env

| Scope | Where | Examples |
|-------|-------|----------|
| Buildtime ON | Docker `ARG`, `VITE_*` | `VITE_SUPABASE_URL`, `VITE_PAYSTACK_PUBLIC_KEY` |
| Runtime only | Coolify env at start | `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY` |

Never pass runtime secrets as Docker build args.

## Database migrations

When schema changes:

```bash
# Against production DATABASE_URL from secure shell
npm run migrate
npm run verify:database
```

Run migrations before or immediately after deploy when SQL changed.

## Android (separate track)

See chapters **Android Release Process** and **Play Store Process**. Web deploy does not publish mobile builds.
