# Deployment Standard — BamSignal

Production deploys via **Coolify + Docker on Hetzner only**.

**Full runbook:** [`DEPLOYMENT_STANDARD.md`](../../DEPLOYMENT_STANDARD.md) (repository root — reference implementation for the ecosystem).

## Quick reference

| Item | Value |
|------|--------|
| GitHub | `bamsignalhq/bamsignal` |
| Coolify | `https://control.stankings.com` |
| Production URL | https://bamsignal.com |
| Build | `npm run build` (Dockerfile) |
| Start | `node server/production.js` |
| Port | `3000` |
| Health | `GET /health`, `GET /ready` |

See also: [PLATFORM_STANDARD.md](./PLATFORM_STANDARD.md), [ENVIRONMENT_STANDARD.md](./ENVIRONMENT_STANDARD.md).
