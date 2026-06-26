# Launch Checklist

Condensed from `docs/releases/checklists/production-release-checklist.md`. Copy results into release record.

**Release:** v________ @ commit `________`  
**Date:** __________  
**Release Engineer:** __________

## Code freeze

- [ ] `main` only; no unrelated commits
- [ ] Release record from `docs/releases/templates/release-template.md`
- [ ] Rollback commit documented

## Tests

- [ ] `npm run build` — PASS
- [ ] `npm run lint` — PASS
- [ ] `npm run test:server-import` — PASS
- [ ] `npm run test` — PASS (certification suite)
- [ ] `npm run certify:rc` — PASS (major releases)

## Security

- [ ] No secrets in diff
- [ ] Auth UI: username + PIN only
- [ ] Admin routes separate from member routes
- [ ] `/ready?details=1` gated by diagnostics secret

## Environment

- [ ] `.env.example` matches Coolify
- [ ] `DATABASE_URL`, Paystack, Resend, photo storage set
- [ ] `ADMIN_BOOTSTRAP_ENABLED=false`

## Database

- [ ] Migrations reviewed
- [ ] Backup < 24h old
- [ ] `npm run migrate` plan documented

## Payments

- [ ] Paystack **live** keys in production
- [ ] Webhook reachable
- [ ] Purchase confirmation email path tested
- [ ] Payment return path preserved (not public homepage)

## Notifications

- [ ] Firebase push (if used) build + runtime configured
- [ ] Email templates reviewed if changed

## Android (if release includes mobile)

- [ ] `npm run android:verify-assets` — PASS
- [ ] `versionCode` bumped
- [ ] Fresh AAB built
- [ ] Deep link checklist complete
- [ ] `assetlinks.json` SHA matches keystore

## Post-deploy

- [ ] `GET /health` → 200
- [ ] `GET /ready` → 200
- [ ] `npm run smoke:production` — PASS
- [ ] Manual: login, discover, payment return
- [ ] Coolify logs clean (no `ready_check_failed` storm)

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Release Engineer | | | ☐ |
| Operations | | | ☐ |
| Founder | | | ☐ |
