# Post-Deploy Checklist — Production Verified 2026-07-22

**Folder:** Cursor/BamSignal  
**Commit:** `e574d50` | **Build:** `bamsignal-v1.0.17-20-mrw8he3r`

## Immediate — COMPLETE

- [x] Coolify build succeeded
- [x] Container health check green (`GET /ready` → 200)
- [x] `GET /health` returns `{"ok":true,"alive":true}`
- [x] Deploy metadata: commit `e574d50`, version `0.1.0`
- [x] Database connectivity confirmed via `/ready`
- [x] Rolling deployment drained old container

## Migrations — COMPLETE

- [x] Migrations `0056`–`0063` applied
- [x] `schema_migrations` includes `0063_passport_integration`
- [x] Tables: `ops_support_ticket_state`, `member_passport_registry`, `passport_sync_queue`

## Live Smoke — COMPLETE

- [x] `npm run smoke:production` — 19/19 PASS
- [x] Landing, signup, login, discover, signals, chats, profile pages
- [x] Auth, payment, feature-flag, remote-config APIs mounted
- [x] Member APIs require auth (401 without session)

## Security — PARTIAL

- [x] Production runtime: 0 critical advisories
- [x] `websocket-driver` → 0.7.5
- [x] Admin auth header-only verified
- [ ] Optional: `body-parser` 2.3.0, `protobufjs` 7.6.5
- [ ] Dev-only advisories documented as accepted

## Observability — OPERATIONAL

- [x] `/ready` reports database connected
- [ ] Configure alerting on sustained `/ready` 503
- [ ] Monitor payment webhook failure rate
- [ ] Monitor passport sync queue depth

## Operational — PENDING

- [ ] DR PITR restore drill (schedule Q3 2026)
- [ ] Coolify `BUILD_TIME` build arg (optional)
- [ ] Member support ticket UI wiring (P2)

## Sign-Off

| Role | Date | Status |
|------|------|--------|
| Release Engineering | 2026-07-22 | Verified |
| Platform Operations | | Pending |
| Security | | Accepted residual |
