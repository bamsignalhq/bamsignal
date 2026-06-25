# Secrets Rotation Policy

Rotation procedures for BamSignal credentials. **This document does not rotate secrets automatically** — it defines when and how humans rotate them safely.

---

## Principles

1. **Never commit secrets** to git — including rotation commits
2. **Rotate in Coolify/runtime first**, then update password manager
3. **Verify `/ready`** after every production rotation
4. **Document rotation date** in password manager notes (not in repo)
5. **No dual-write** — old secret invalidated after cutover verified

---

## Rotation schedule

| Secret class | Cadence | Owner | Trigger for early rotation |
|--------------|---------|-------|---------------------------|
| `CRON_SECRET` | Quarterly | Security | Leak suspicion |
| `DIAGNOSTICS_SECRET` | Quarterly | Security | Leak suspicion |
| `COMMAND_CENTER_PIN` | Quarterly | Security | Personnel change |
| `SUPABASE_SERVICE_ROLE_KEY` | Quarterly | Engineering | Supabase dashboard rotation |
| `RESEND_API_KEY` | Annual | Engineering | Resend dashboard |
| `SENDCHAMP_API_KEY` | Annual | Operations | Vendor policy |
| `PAYSTACK_SECRET_KEY` | On compromise only | Finance Ops | Fraud, leak, employee offboarding |
| `PAYSTACK_WEBHOOK_SECRET` | On compromise | Finance Ops | Webhook replay suspicion |
| Google OAuth secrets | Annual | Operations | Google Cloud policy |
| Zoom credentials | Annual | Operations | Zoom admin policy |
| Firebase service account | On compromise | Engineering | Key leak |
| `TELEGRAM_BOT_TOKEN` | On compromise | Engineering | Bot abuse |
| Android upload keystore | **Never** unless compromised | Engineering | Play upload key reset |

---

## Rotation procedure (production)

### 1. Prepare

- [ ] Schedule maintenance window if user-facing impact possible
- [ ] Confirm rollback path ([deployment-recovery.md](../../runbooks/deployment-recovery.md))
- [ ] Run `ENV_TARGET=production npm run env:validate` baseline

### 2. Generate new credential

- Provider dashboard (Supabase, Paystack, Resend, etc.)
- Record new value in password manager only

### 3. Update Coolify

- Runtime vars: update → **Restart container** (rolling if multi-instance)
- Buildtime `VITE_*`: update → **Rebuild** Docker image (required for client embed)

### 4. Verify

- [ ] `GET /ready` → 200
- [ ] Integration smoke (login, payment init, email, photo upload)
- [ ] `npm run env:validate`
- [ ] Invalidate old credential at provider

### 5. Document

- Password manager: rotation date, operator name
- If incident-driven: [incident template](../../releases/templates/incident-template.md)

---

## Service-specific notes

### Supabase

- Rotate service role in Supabase dashboard → Project Settings → API
- Update `SUPABASE_SERVICE_ROLE_KEY` in Coolify
- Anon key rotation requires updating both `VITE_SUPABASE_ANON_KEY` (rebuild) and `SUPABASE_ANON_KEY` (runtime)

### Paystack

- Live secret rotation requires Paystack dashboard + webhook re-verification
- Never put `sk_*` in Docker build args
- After rotation: test initialize + webhook with test transaction

### Resend

- New API key → update `RESEND_API_KEY` → restart → test signup email

### SendChamp

- Rotate API key → verify WhatsApp templates still approved

### Google / Zoom OAuth

- Refresh tokens may require re-authorization flow
- Update redirect URIs if domain changes

### Admin PIN

- `COMMAND_CENTER_PIN` — coordinate with operators before change
- No user-facing copy references "password" for member login

---

## What not to rotate casually

| Item | Reason |
|------|--------|
| Android upload keystore | Play signing identity — see [ANDROID_RELEASE_NOTES.md](../../../ANDROID_RELEASE_NOTES.md) |
| Supabase project ID (URL) | Data migration required |
| `com.bamsignal.com` package ID | New Play Store listing |
| Production domain | DNS + SSL + callback URL cascade |

---

## Related

- [disaster-recovery.md](./disaster-recovery.md)
- [verification-checklist.md](./verification-checklist.md)
- [../monitoring/alerts.md](../monitoring/alerts.md)
