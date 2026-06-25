# Environment Verification Checklist

Run before promoting config changes or deploying to staging/production.

Copy results into [release record](../../releases/templates/release-template.md) **Migration → Environment Variables** section.

**Release:** ________________  
**Target:** staging / production  
**Date:** YYYY-MM-DD  
**Engineer:** ________________

---

## Automated validation

- [ ] `.env.example` updated for any new variables
- [ ] `shared/environmentRegistry.mjs` updated (if validation rules added)
- [ ] `ENV_TARGET=<target> npm run env:validate` — **pass**
- [ ] `ENV_TARGET=<target> npm run env:validate -- --strict` — pass (production recommended)
- [ ] Report saved: `play-store/environment-validation-report.json`

---

## Build vs runtime separation

- [ ] No runtime secrets in `Dockerfile` ARG/ENV
- [ ] All `VITE_*` in Coolify **Buildtime ON** only
- [ ] `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, service role keys **Runtime ON** only
- [ ] Docker image rebuild planned if any `VITE_*` changed

---

## Critical production gates (`/ready`)

- [ ] `DATABASE_URL` — set, reachable
- [ ] `PAYSTACK_SECRET_KEY` — `sk_live_` in production (not `sk_test_`)
- [ ] `RESEND_API_KEY` — set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — valid format (`eyJ` or `sb_secret_`)
- [ ] Photo storage — Supabase buckets accessible

---

## URL and callback alignment

- [ ] `PUBLIC_APP_URL` = `https://bamsignal.com` (production)
- [ ] `VITE_PUBLIC_APP_URL` matches `PUBLIC_APP_URL` (production)
- [ ] `PAYSTACK_CALLBACK_URL` → `/payment/success` on production domain
- [ ] `PAYSTACK_WEBHOOK_URL` matches Paystack dashboard
- [ ] `PAYSTACK_ANDROID_CALLBACK_URL` = `com.bamsignal.com://payment-success`
- [ ] `GOOGLE_REDIRECT_URI` matches Google Cloud OAuth config
- [ ] No `localhost` in production URL vars

---

## Supabase parity

- [ ] `VITE_SUPABASE_URL` === `SUPABASE_URL` (same project)
- [ ] Client anon key matches project (`VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`)
- [ ] Staging does not point at production database

---

## Paystack parity

- [ ] `VITE_PAYSTACK_PUBLIC_KEY` is `pk_live_` (production)
- [ ] Public and secret keys from same Paystack mode (both live)
- [ ] Webhook URL reachable from Paystack (firewall/Coolify)

---

## Duplicate variable groups

Canonical values only — aliases must match or be unset:

- [ ] Paystack public: `VITE_PAYSTACK_PUBLIC_KEY` canonical
- [ ] Supabase URL: `SUPABASE_URL` canonical at runtime
- [ ] Service role: `SUPABASE_SERVICE_ROLE_KEY` canonical
- [ ] Admin PIN: `COMMAND_CENTER_PIN` canonical

---

## Security flags

- [ ] `ADMIN_BOOTSTRAP_ENABLED=false` (production)
- [ ] `LEGACY_SETUP_ENABLED=false` (production)
- [ ] `CRON_SECRET` set and not placeholder
- [ ] `COMMAND_CENTER_PIN` set and not default
- [ ] No secrets in git diff

---

## Integration smoke (staging or production)

- [ ] Member login (username + PIN)
- [ ] Signup email sends
- [ ] Photo upload
- [ ] Paystack initialize (small test amount staging)
- [ ] Payment return path preserved
- [ ] Push notification (if Firebase configured)
- [ ] WhatsApp OTP (if SendChamp configured)

---

## Post-deploy

- [ ] `curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/ready` → 200
- [ ] Coolify logs: no `ready_check_failed` storm
- [ ] `npm run test:server-import` (CI / pre-push)

---

## Android / PWA (if release includes mobile)

- [ ] `npm run android:verify-upload-key` (when upload key resolved)
- [ ] Deep link checklist if payment paths changed
- [ ] Service worker cache version bumped

---

## Sign-off

| Role | Name | Date | Verified |
|------|------|------|----------|
| Engineering | | | ☐ |
| DevOps | | | ☐ |
| Security | | | ☐ |

---

## Related

- [environment-promotion.md](./environment-promotion.md)
- [configuration-drift.md](./configuration-drift.md)
- [../../releases/checklists/production-release-checklist.md](../../releases/checklists/production-release-checklist.md)
