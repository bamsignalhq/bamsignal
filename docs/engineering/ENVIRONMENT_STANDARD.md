# Environment Standard — Stankings Ecosystem

Shared runtime and build-time variables. **Identical names** across BamSignal, Yike, BayRight, and Stankings.

## Shared platform variables (Coolify runtime)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `APP_ENV` | Recommended | `production` | Logical environment label (`production`, `staging`) |
| `NODE_ENV` | Yes | `production` | Node runtime mode |
| `APP_VERSION` | Optional | `1.0.0` | Release version (defaults to package.json) |
| `DEPLOY_PLATFORM` | Recommended | `coolify` | Orchestrator |
| `DEPLOY_PROVIDER` | Recommended | `hetzner` | Host provider |
| `GIT_COMMIT_SHA` | Recommended | `abc123…` | Deployed commit |
| `BUILD_TIME` | Optional | ISO8601 | Image build timestamp |
| `LOG_LEVEL` | Optional | `info` | `debug` \| `info` \| `warn` \| `error` |
| `CRON_SECRET` | If crons | hex string | Bearer token for scheduled HTTP jobs |
| `PORT` | Optional | `3000` | Container listen port |

Coolify may inject `COOLIFY_SOURCE_COMMIT` — treated as alias for `GIT_COMMIT_SHA`.

## Rules

1. **Runtime secrets** in Coolify only — never git, never Docker build args (except public `VITE_*` / `NEXT_PUBLIC_*`).
2. **Product-specific** vars (Supabase, Paystack, Resend, etc.) documented in each repo `.env.example`.
3. **Never commit** `.env`, `.env.local`, or production secret files.

## BamSignal product variables

See root `.env.example` — Supabase, Paystack, Sendchamp, Resend, Firebase, etc.

## Verification

```bash
npm run env:validate   # BamSignal connectivity check where available
```

After deploy, confirm health endpoint shows expected `environment`, `platform`, `commit`.
