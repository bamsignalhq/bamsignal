# Deployment Discrepancy Report
**Generated:** 2026-06-27T23:13:02.857Z
## Root cause
**Local repository contains `/api/feature-flags` and `/api/remote-config`, but `origin/main` does not.** Coolify builds from GitHub `main`, so production runs an older server bundle without these mounts. Production returns Express `Cannot GET` HTML 404 (route not registered), not SPA fallback.
## Evidence
- Production `GET /api/feature-flags` → 404 (Express Cannot GET)
- Production `GET /api/remote-config` → 404 (Express Cannot GET)
- Production `POST /api/auth/pin-login` → 401 (route exists on prod)
- Local inventory: 57 routes; critical routes mounted=true
- Local HEAD: 6a7e192d7ec632b65b0d481ef9aa839b51addb1c
- origin/main: a66155ecd4ca86e4dd083f431f878d35a259447f
- Ahead of origin/main: 52 commits
- origin/main includes feature-flags mount: false
- Production HTML build meta: bamsignal-v1.0.14-17-mqupx88v
## Version comparison
| Field | Local | Production |
|-------|-------|------------|
| Git commit | `6a7e192d7ec6` | deployed marker `bamsignal-v1.0.14-17-mqupx88v` |
| origin/main | `a66155ecd4ca` | Coolify builds from this ref |
| Commits ahead of origin | 52 | routes not pushed if > 0 |
| Build version | 1.0.15.18 | bamsignal-v1.0.14-17-mqupx88v |
| Build cache id | bamsignal-v1.0.15-18-mqw9cpp8 | from HTML meta |
## Critical routes
| Route | Local mount | Handler file | Production status |
|-------|-------------|--------------|-------------------|
| `GET /api/feature-flags` | yes | yes | HTTP 404 (Express 404) |
| `GET /api/remote-config` | yes | yes | HTTP 404 (Express 404) |
## Registered API routes (local inventory)
Total routes parsed from server/app.js: **57**
- `POST /api/admin/bootstrap`
- `POST /api/admin/city-home`
- `GET /api/admin/city-spotlight`
- `POST /api/admin/consent`
- `POST /api/admin/members`
- `POST /api/admin/moderation`
- `POST /api/auth/email-code`
- `POST /api/auth/identity`
- `POST /api/auth/login-security`
- `POST /api/auth/pin-login`
- `POST /api/auth/pin-reset`
- `POST /api/auth/play-reviewer-finish`
- `GET /api/calendar`
- `POST /api/calendar`
- `GET /api/city/home`
- `GET /api/city/spotlight`
- `POST /api/city/spotlight-event`
- `POST /api/concierge-email`
- `POST /api/concierge-persistence`
- `POST /api/concierge-whatsapp`
- `POST /api/consultation-payment`
- `POST /api/consultation-payments`
- `GET /api/consultation-scheduling`
- `POST /api/consultation-scheduling`
- `POST /api/contact`
- `GET /api/diagnostics/certification`
- `POST /api/diagnostics/certification`
- `GET /api/diagnostics/db-ping`
- `HEAD /api/diagnostics/db-ping`
- `GET /api/diagnostics/function-security`
- `POST /api/diagnostics/function-security`
- `GET /api/diagnostics/paystack-connectivity`
- `GET /api/diagnostics/view-security`
- `POST /api/diagnostics/view-security`
- `GET /api/feature-flags`
- `GET /api/hard/setup`
- `POST /api/hard/setup`
- `POST /api/meeting-infrastructure`
- `POST /api/meeting-link`
- `POST /api/member/data`
- … +9 more
## Deployment mismatch
Git divergence: local main is 52 commits ahead of origin/main. Coolify never received commits that add feature-flags and remote-config (from `af251e7` onward). Production build marker `bamsignal-v1.0.14-17-mqupx88v` matches pre-route release `v1.0.14-17`.
## Required corrective action
1. Push local `main` to `github.com/bamsignalhq/bamsignal` (`git push origin main`).
2. Trigger Coolify redeploy (disable cache reuse / force rebuild if needed).
3. Confirm production HTML meta updates to `bamsignal-v1.0.15-18-*` or newer.
4. Verify `GET /api/feature-flags` and `GET /api/remote-config` return HTTP 200.
5. Re-run `npm run smoke:production` and `npm run certify:rc`.
