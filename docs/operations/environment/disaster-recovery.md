# Environment Disaster Recovery

Recovery procedures for lost, compromised, or expired credentials. **Does not perform rotation** — follow [rotation-policy.md](./rotation-policy.md) after recovery.

---

## General principles

1. **Assume compromise** until proven otherwise — rotate after leak
2. **Never commit** replacement secrets to git
3. **Restore service first**, full rotation second
4. **Document** in [incident template](../../releases/templates/incident-template.md)
5. Use password manager as source of truth post-recovery

---

## Lost secrets (unknown values)

| Secret | Recovery |
|--------|----------|
| Coolify env vars lost | Password manager backup → re-enter in Coolify → restart |
| Password manager lost | Recover from Coolify UI export (secure channel) → rebuild vault |
| `.env` deleted locally | Copy structure from `.env.example` → fill from vault |
| Supabase service role unknown | Supabase dashboard → regenerate service role key |
| Paystack secret unknown | Paystack dashboard → API keys → regenerate |
| Resend key unknown | Resend dashboard → create new API key |
| Android keystore lost | [ANDROID_RELEASE_NOTES.md](../../../ANDROID_RELEASE_NOTES.md) — upload key reset |

---

## Compromised secrets

| Secret | Immediate action | Follow-up |
|--------|------------------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Regenerate in Supabase; update Coolify; audit RLS logs | [rotation-policy.md](./rotation-policy.md) |
| `PAYSTACK_SECRET_KEY` | Regenerate; disable old key; review Paystack transactions | [payment-recovery.md](../../runbooks/payment-recovery.md) |
| `DATABASE_URL` leaked | Rotate DB password; update connection string; review access logs | Supabase support if needed |
| `CRON_SECRET` / `DIAGNOSTICS_SECRET` | Generate new; update Coolify; review cron/diagnostics access logs | Quarterly rotation |
| `COMMAND_CENTER_PIN` | Change PIN; notify operators | Security review |
| `RESEND_API_KEY` | Revoke; create new | Check email abuse |
| `SENDCHAMP_API_KEY` | Revoke; create new | Check WhatsApp send logs |
| Firebase JSON leaked | Delete service account key; create new | Firebase console audit |
| Android keystore leaked | Play upload key reset; treat as P1 | Security incident |

---

## Expired API keys

| Provider | Symptoms | Recovery |
|----------|----------|----------|
| Resend | Signup email fails; `/ready` signupEmail false | New key in Resend → Coolify → restart |
| SendChamp | WhatsApp OTP fails | Renew key; verify sender approval |
| Google OAuth | Calendar 503; refresh fails | Re-run OAuth consent; update refresh token |
| Zoom | Meeting links fail | Regenerate OAuth credentials |
| Paystack | Payments 503 | Paystack dashboard key status |
| SSL/TLS cert | HTTPS errors | Coolify / DNS provider renewal |
| Supabase JWT | Auth errors after rotation | Sync anon + service keys build/runtime |

---

## Supabase credential replacement

1. Supabase dashboard → Project Settings → API
2. Note project URL (must match `VITE_SUPABASE_URL` / `SUPABASE_URL`)
3. Regenerate service role key
4. Update Coolify runtime: `SUPABASE_SERVICE_ROLE_KEY`
5. If anon key rotated: update `VITE_SUPABASE_ANON_KEY` (rebuild) + `SUPABASE_ANON_KEY` (runtime)
6. Restart container; verify `/ready`
7. Run `node scripts/verify-database.mjs` on staging first if possible

Full database loss: [database-restore.md](../../runbooks/database-restore.md)

---

## Payment credential replacement

1. Paystack dashboard → Settings → API Keys
2. Generate new secret; update `PAYSTACK_SECRET_KEY`
3. Update webhook secret if separate
4. Update `VITE_PAYSTACK_PUBLIC_KEY` if public key rotated (**rebuild required**)
5. Verify Paystack webhook URL unchanged
6. Test payment flow on staging
7. Reconcile ledger for outage window ([payment-recovery.md](../../runbooks/payment-recovery.md))

---

## Notification credential replacement

### Email (Resend)

1. Create new API key
2. Update `RESEND_API_KEY` in Coolify
3. Restart; test signup + purchase confirmation email

### Push (Firebase)

1. Firebase console → Service accounts → new key
2. Update `FIREBASE_SERVICE_ACCOUNT_JSON` in Coolify (single-line JSON)
3. Rebuild if `VITE_FIREBASE_*` client vars changed
4. Test push to device

### WhatsApp (SendChamp)

1. Rotate `SENDCHAMP_API_KEY`
2. Verify sender and templates still approved
3. Test OTP flow

---

## Recovery verification checklist

- [ ] `ENV_TARGET=production npm run env:validate -- --strict`
- [ ] `GET /ready` → 200
- [ ] Member login
- [ ] Signup email
- [ ] Payment initialize + webhook
- [ ] Photo upload
- [ ] Admin console login
- [ ] Incident record closed with preventive actions

---

## Related

- [rotation-policy.md](./rotation-policy.md)
- [verification-checklist.md](./verification-checklist.md)
- [../../runbooks/README.md](../../runbooks/README.md)
- [../monitoring/incident-escalation.md](../monitoring/incident-escalation.md)
