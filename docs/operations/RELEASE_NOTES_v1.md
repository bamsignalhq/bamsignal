# BamSignal Release Notes — v1.0.0 (Production)

**Folder:** Cursor/BamSignal  
**Release date:** 2026-07-22  
**Production URL:** https://bamsignal.com  
**Git commit:** `e574d50fdd31073bc7354315e33d3e07bee03daf`  
**Deploy build:** `bamsignal-v1.0.17-20-mrw8he3r`  
**Certification version:** 1.7.0

## Production Deployment Verified

| Field | Value |
|-------|-------|
| Version | `0.1.0` |
| Commit | `e574d50` |
| Ready | `true` |
| Database | `connected` |
| Live smoke | 19/19 PASS |

## Platform Capabilities (Backend Complete)

- **Infrastructure** — Coolify/Hetzner, `/health`, `/ready`, graceful shutdown
- **Authentication** — Username + PIN lifecycle, session management
- **Financial Core** — Paystack, membership commerce, idempotency
- **Messaging** — Conversations, delivery queue, notifications, presence
- **Operations** — Moderation, support tickets, concierge queue, audit log
- **Trust Platform** — Passport integration, async sync, reputation inputs
- **Production Hardening** — Security/performance/resilience audits, journey certification

## Database Migrations Applied

Through `0063_passport_integration` on Supabase `nswiwxmavuqpuzlsascs`.

## Release Engineering Fixes (e574d50)

- Deploy metadata: version and commit now reported on `/ready`
- Security cert: admin auth check aligned with `operationSecrets` pattern
- Production dependency: `websocket-driver` pinned to 0.7.5

## Known Non-Blocking Items

- `buildTime` null on `/ready` — Coolify build arg not configured
- Support ticket member UI not yet wired
- DR PITR restore drill scheduled (not yet executed)
- Dev-only npm advisories (`tar`, `brace-expansion`) — not in production runtime

## Validation Commands

```bash
npm run smoke:production      # Live — 19/19 PASS
npm run certify:production    # Local certification suite
npm run verify:supabase-project -- --require-linked
```
