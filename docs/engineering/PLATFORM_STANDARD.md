# Platform Standard — Stankings Ecosystem

Canonical approved production stack. **Coolify only** for hosting — Vercel is decommissioned and must not be reintroduced.

## Approved stack

| Layer | Technology |
|-------|------------|
| Source control | GitHub (one GitHub App per product repo) |
| CI | GitHub Actions (lint, typecheck, build — not production deploy) |
| Hosting | Hetzner |
| Orchestration | Coolify (`https://control.stankings.com`) |
| Edge & DNS | Cloudflare |
| Database & auth | Supabase |
| Email | Resend (+ Sendchamp for SMS/WhatsApp where applicable) |
| Payments | Paystack (BamSignal) |
| Monitoring | Health endpoints + Coolify container health |

## Production deployment policy

1. Push to `main` on the product GitHub repo.
2. Coolify GitHub App webhook triggers Docker build from repo `Dockerfile`.
3. Runtime secrets live in **Coolify only** — never in git, never in Docker build args except public `VITE_*`.
4. Verify deploy: container healthy → production URL 200 → `GET /ready`.
5. **Do not deploy to Vercel.**

## Architecture

```
GitHub
  │
  ▼
Coolify (control.stankings.com)
  │
  ▼
Hetzner (shared host, per-product containers)
  │
  ├── Supabase (Postgres, Auth, Storage)
  │
  └── Cloudflare (DNS, Access, CDN/WAF)
```

## BamSignal references

| Item | Location |
|------|----------|
| Deployment | `DEPLOYMENT_STANDARD.md` |
| Health | `GET /health` (liveness), `GET /ready` (readiness) |
| Production URL | https://bamsignal.com |

## Deployment metadata (standard across all products)

Set in **Coolify** (runtime). Optional but recommended for health endpoints and monitoring:

| Variable | Example | Purpose |
|----------|---------|---------|
| `APP_ENV` | `production` | Logical environment label |
| `DEPLOY_PLATFORM` | `coolify` | Orchestrator |
| `DEPLOY_PROVIDER` | `hetzner` | Host provider |
| `APP_VERSION` | `1.0.0` | Release version (defaults to package.json) |
| `GIT_COMMIT_SHA` | `abc123…` | Deployed commit (Coolify may inject `COOLIFY_SOURCE_COMMIT`) |
| `BUILD_TIME` | ISO8601 | Image build timestamp |
| `NODE_ENV` | `production` | Node runtime mode |

## Health endpoint schema (standard)

Every product exposes the same core fields (product-specific extensions allowed):

```json
{
  "status": "ok",
  "application": "bamsignal",
  "version": "1.0.0",
  "environment": "production",
  "platform": "coolify",
  "provider": "hetzner",
  "commit": "abc123",
  "buildTime": "2026-07-21T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "timestamp": "2026-07-21T12:00:00.000Z"
}
```

| Product | Endpoint |
|---------|----------|
| BamSignal | `GET /health`, `GET /ready` |
| BayRight | `GET /api/health` |
| Yike | `GET /api/public-health` |
| Stankings | `GET /api/health`, `GET /api/health?ready=1` |

Implementation: `server/deployMetadata.js` (BamSignal) or `src/lib/deploy-metadata.ts` (Next.js products).

## Supabase Auth redirects

Production Supabase projects must **not** allow `*.vercel.app`. See `docs/engineering/SUPABASE_REDIRECT_AUDIT.md` (Stankings repo) for the ecosystem checklist.

## Engineering standards (frozen Sprint 0.7)

| Document | Purpose |
|----------|---------|
| [PLATFORM_STANDARD.md](./PLATFORM_STANDARD.md) | This file — canonical stack |
| [DEPLOYMENT_STANDARD.md](./DEPLOYMENT_STANDARD.md) | Deploy workflow |
| [ENVIRONMENT_STANDARD.md](./ENVIRONMENT_STANDARD.md) | Shared env vars |
| [HEALTH_STANDARD.md](./HEALTH_STANDARD.md) | Health envelope |
| [LOGGING_STANDARD.md](./LOGGING_STANDARD.md) | Startup logging |
| [PROJECT_IDENTITY.md](./PROJECT_IDENTITY.md) | Application identity |
| [PLATFORM_FREEZE.md](./PLATFORM_FREEZE.md) | Infrastructure freeze policy |

## Rollback

Redeploy previous successful Coolify deployment from the Coolify UI.

## Historical note

Archived launch-war-room and audit docs may mention Vercel during migration. Those are historical only. Production authority is Coolify.
