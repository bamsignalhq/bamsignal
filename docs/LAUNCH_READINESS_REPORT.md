# Launch Readiness Report — Friends & Family

**Date:** 2026-07-19  
**Verdict:** Ready to invite F&F after Coolify redeploy + env confirm (`SENDCHAMP_SENDER=YIKE`, `ADMIN_SECRET` set).

## Greens confirmed

| Check | Result |
|-------|--------|
| `/health` | 200 (pre-deploy) |
| `/ready` | 200 (pre-deploy) |
| Auth login UI | Username + PIN; Forgot PIN |
| Public routes vs member restore | Isolated |
| Onboarding gate | Incomplete → `/onboarding`; complete → `/home` |
| Photo upload-first | Healthy |
| Discover → signal → match | Healthy |
| Paystack premium return / idempotency | Healthy |

## P0/P1 fixed this pass

| Item | Fix |
|------|-----|
| SMS messaging gate + WhatsApp OTP | SMS routes + Chats wizard; WhatsApp OTP → 410 |
| Messages not reaching peer | Fan-out on shared `match_id` |
| Block/unmatch local-only | `member_blocks` + server unmatch + send enforce |
| CRON_SECRET = admin | `ADMIN_SECRET` isolation |
| Wallet return hardcoded `/home` | Uses stored return path |
| Referrals half-flow | UI gated off by default |

## Explicit non-goals (parked)

Face-match AI, member UI redesign, SEO sitemap unification, Lighthouse report, mass TODO cleanup, FCM token store + social push send.

## Commands run

- `node scripts/test-verification-identity.mjs` — pass  
- `node scripts/test-cron-secret-isolation.mjs` — pass  
- `npm run test:server-import` — pass  
- `npm run build` — pass  

## Deploy gate

1. Push launch commit to `main`  
2. Confirm Coolify rebuild succeeds  
3. Confirm env: `SENDCHAMP_SENDER=YIKE`, `ADMIN_SECRET` ≠ `CRON_SECRET`  
4. Re-run smoke checklist in `LAUNCH.md`  
5. Manual F&F acceptance path with real SMS OTP  

## Stop

F&F invite is the next human step after post-deploy smoke + one live SMS OTP proof.
