# BamSignal Launch Program

**Program:** BamSignal Ecosystem Launch Program  
**Current sprint:** Sprint 1.1 — Production Hardening & Certification  
**Production:** https://bamsignal.com  
**Health:** `GET /health` (liveness) · `GET /ready` (readiness)  
**Certification:** `npm run certify:production`

---

## Sprint 1.1 — Production Hardening (in progress)

Infrastructure sprint — no UI, no feature work.

| Capability | Status |
|------------|--------|
| Rate limit memory fallback | Database authoritative; memory fallback during outages |
| PIN auth memory fallback | Configurable via `PIN_AUTH_*` env; observable |
| Startup secret validation | `ADMIN_SECRET`, `DIAGNOSTICS_SECRET`, `CRON_SECRET` uniqueness |
| Environment registry levels | Critical · Required · Recommended · Deprecated |
| Production certification | `npm run certify:production` → Markdown + JSON report |
| PR checks workflow | `.github/workflows/pr-checks.yml` |
| Branch governance | [docs/engineering/BRANCH_GOVERNANCE.md](./docs/engineering/BRANCH_GOVERNANCE.md) |

**Pre-launch gate:**

```bash
npm run certify:production
```

Reports: `certification/production/reports/latest.md` and `latest.json`

---

# BamSignal Launch — Friends & Family

**Status:** Code shipped to `main` (`1f76cda`); **Coolify redeploy required** before live SMS routes  
**Commit:** `89a11fb` (launch) · `1f76cda` (410 error helper)  
**Date:** 2026-07-19  
**Coolify:** https://control.stankings.com → app `wn3vlu5j7zwp5danjqfcvr2z` (alias: https://control.bamsignal.com)

> Pre-deploy probe (2026-07-19): `/health`+`/ready` = 200; SMS routes still **404** until Coolify rebuilds from `main`.

---

## Product locks (do not reopen)

- Login = username + PIN only (Forgot PIN)
- Onboarding: Register → Email OTP → profile → photos → **browse** (no SMS on onboarding)
- Messaging trust gate: first message → **SMS Verification (YIKE)** → selfie **submit** → unlock
- Email OTP stays for ownership / PIN recovery
- No face-match AI; selfie uses existing admin review queue
- Member UI frozen except bug fixes

---

## Changelog (this launch pass)

1. **SMS Verification** via Sendchamp (`channel: sms`, sender `YIKE`)
   - `POST /api/verify/sms/start` · `POST /api/verify/sms/confirm` (member auth required)
   - WhatsApp OTP routes return **410** (concierge WhatsApp templates unchanged)
2. **First-message gate** in Chats — SMS + selfie submit unlocks messaging; draft sent after unlock
3. **Message fan-out** — peer receives messages on shared match thread
4. **Server-side block / unmatch** — `member_blocks` + enforce on send; unmatch deletes both sides
5. **Admin secret isolation** — `ADMIN_SECRET` for admin automation; CRON no longer equals admin when set
6. **Wallet Paystack return** uses stored `paymentReturnPath` (not hard `/home`)
7. **Referrals UI** gated by `VITE_ENABLE_REFERRALS_UI` (default off)
8. Match push deep-link opens **Chats** (not Likes)

---

## Coolify env checklist (no secrets)

| Variable | Required | Notes |
|----------|----------|--------|
| `SENDCHAMP_API_KEY` | yes | Sendchamp account |
| `SENDCHAMP_SENDER` / `SMS_SENDER_ID` | yes | **`YIKE`** |
| `SMS_PROVIDER` | optional | default `sendchamp` |
| `SMS_VERIFICATION_REQUIRED_FOR_MESSAGING` | optional | default `true` |
| `SELFIE_VERIFICATION_REQUIRED_FOR_MESSAGING` | optional | default `true` |
| `DEFAULT_COUNTRY` / `DEFAULT_PHONE_REGION` / `SUPPORTED_COUNTRIES` | optional | default `NG` |
| `OTP_LENGTH` / `OTP_EXPIRY_MINUTES` / `OTP_MAX_ATTEMPTS` / `OTP_RESEND_SECONDS` | optional | 6 / 30 / 5 / 60 |
| `ADMIN_SECRET` | yes (prod) | Distinct from `CRON_SECRET` |
| `CRON_SECRET` | yes | Cron jobs only (`x-cron-secret`) |
| `TELEGRAM_WEBHOOK_SECRET` | if Telegram webhook used | No CRON fallback |
| `DATABASE_URL`, Paystack, Resend, Supabase | yes | Existing runtime set |

Run migration `0048_member_blocks.sql` (or `npm run migrate`) after deploy so blocks persist across restarts (app also `CREATE TABLE IF NOT EXISTS` as safety net).

---

## Smoke checklist (post-deploy)

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://bamsignal.com/health   # 200
curl -sS -o /dev/null -w '%{http_code}\n' https://bamsignal.com/ready    # 200
curl -sS -X POST https://bamsignal.com/api/verify/whatsapp/start -H 'content-type: application/json' -d '{}'
# expect 410 whatsapp_otp_retired
curl -sS -X POST https://bamsignal.com/api/verify/sms/start -H 'content-type: application/json' -d '{}'
# expect 401 (auth required), not 404
```

---

## Friends & Family Acceptance Test

```
Register → Email OTP → Profile → Photos → Browse
→ Like → Receive Like → Match → Open chat → First message
→ SMS wizard → OTP (YIKE) → Selfie submit → Messaging unlocked
→ Exchange messages (both sides) → Buy Premium → Logout → Login → Restored
```

Any step fail = P0. Also: no auth loops; no 500s on this path.

---

## Known issues (post F&F / P2)

- Per-user FCM push send not implemented (topic subscribe only) — in-app messaging works
- Consultant portal still uses local PIN gate (not member surface)
- SEO sitemap static vs runtime unification / Lighthouse — after F&F
- Schema probe cosmetics / certification script inventory — after F&F

---

## Rollback

1. Coolify → previous successful deployment for app `wn3vlu5j7zwp5danjqfcvr2z`
2. Or `git revert` launch commit on `main` and redeploy
3. WhatsApp OTP routes are already retired; do not re-enable without product decision

---

## Support

- Ops: Coolify control.bamsignal.com  
- Product: BamSignal F&F cohort via founder channel  
- Do not share runtime secrets in chat or tickets
