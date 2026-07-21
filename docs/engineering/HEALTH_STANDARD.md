# Health Standard — Stankings Ecosystem

All products expose a **standard health envelope**. Product-specific detail lives in `diagnostics` (optional).

## Core fields (required)

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `ok` \| `degraded` \| `maintenance` |
| `application` | string | Product id (`bamsignal`, `yike`, `bayright`, `stankings`) |
| `version` | string | App version |
| `environment` | string | From `APP_ENV` |
| `platform` | string | From `DEPLOY_PLATFORM` (default `coolify`) |
| `provider` | string | From `DEPLOY_PROVIDER` (default `hetzner`) |
| `commit` | string \| null | Git SHA |
| `buildTime` | string \| null | ISO8601 build time |
| `uptime` | number | Process uptime (seconds) |
| `timestamp` | string | ISO8601 response time |
| `database` | string | `connected` \| `unreachable` \| `skipped` \| `unknown` |

## Optional

| Field | Description |
|-------|-------------|
| `diagnostics` | Product-specific object — never secrets |

## BamSignal endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | **Liveness only** — `{ ok, service, alive }` (Docker HEALTHCHECK) |
| `GET /ready` | Readiness — standard envelope + `ready` flag |
| `GET /ready?details=1` | Full diagnostics (auth required) |

Implementation: `server/deployMetadata.js`, `server/services/readiness.js`.

## Rules

- Never expose secrets, API keys, or connection strings in health responses.
- Liveness endpoints must stay minimal for fast probes.
