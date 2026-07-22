# Deployment Guide

## Target

- **Platform:** [Coolify](https://control.stankings.com) on Hetzner
- **Production URL:** https://bamsignal.com
- **Repository:** github.com/bamsignalhq/bamsignal
- **Branch:** `main`

## Pre-Deploy Checklist

```bash
npm run lint
npm run build
npm run test:server-import
npm run certify:production
```

## Coolify Configuration

### Buildtime (Docker ARG — public only)

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_*`
- `VITE_PUBLIC_APP_URL`, `VITE_PAYSTACK_PUBLIC_KEY`

### Runtime (container start — secrets)

- `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`, `RESEND_API_KEY`
- `ADMIN_SECRET`, `CRON_SECRET`, `DIAGNOSTICS_SECRET`
- See `.env.example` for full list

## Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness — process alive |
| `GET /ready` | Readiness — dependencies OK (Docker HEALTHCHECK) |
| `GET /ready?details=1` | Full dependency status (requires diagnostics secret) |

## Deploy Steps

1. Push to `main` on `bamsignalhq/bamsignal`
2. Coolify rebuilds from `Dockerfile`
3. Verify deploy in Coolify dashboard
4. Confirm `GET /ready` returns 200
5. Run production smoke if configured

## Rollback

Coolify → redeploy previous successful build. Database changes are forward-only.

## Migration Order

Migrations in `migrations/` apply sequentially. Latest at time of Sprint 7: `0063_passport_integration.sql`.

Verify with:

```bash
npm run certify:migrations
```
