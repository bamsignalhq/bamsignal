# BamSignal Deployment Report — Production Verified

**Folder:** Cursor/BamSignal  
**Generated:** 2026-07-22  
**Status:** Production deployment verified

## Deployment Summary

| Field | Value |
|-------|-------|
| Repository | `bamsignalhq/bamsignal` |
| Branch | `main` |
| Commit | `e574d50fdd31073bc7354315e33d3e07bee03daf` |
| Version | `0.1.0` |
| Build ID | `bamsignal-v1.0.17-20-mrw8he3r` |
| Deploy timestamp | `2026-07-22T15:29:02.000Z` |
| Platform | Coolify / Hetzner |
| Supabase | `nswiwxmavuqpuzlsascs` |

## Rolling Deployment

| Phase | Observation |
|-------|-------------|
| Pre-deploy | `commit: null`, `version: 0.0.0`, uptime ~3799s |
| Cutover | Brief alternation between old and new containers |
| Post-deploy | Stable on `e574d50`, uptime reset, 19/19 smoke PASS |

## Endpoint Verification (Live)

```
GET /health → {"ok":true,"alive":true}
GET /ready  → version 0.1.0, commit e574d50, ready true, database connected
```

## Migrations

All platform migrations applied (`0056`–`0063`). Tables verified on production Supabase.

## Smoke Certification

**Run:** `smoke-dd9aab70` — **PASS** (100%, 19/19)

## Security (Production Runtime)

`npm audit --omit=dev`: 0 critical, 1 low, 1 moderate (`body-parser`, `protobufjs`).

`websocket-driver` remediated to 0.7.5 via npm override.

## Outstanding (Non-Blocking)

- `buildTime` — not injected by Coolify (P2)
- DR PITR drill — scheduled, not executed (P1)
- Full security cert gate — blocked on dev-only `tar`/`brace-expansion`

## Next Steps

1. Transition to Production Operations monitoring
2. Schedule DR drill
3. Optional: Coolify `BUILD_TIME` build arg
4. Optional: patch `body-parser` 2.3.0, `protobufjs` 7.6.5
