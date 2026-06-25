# Environment Matrix

Per-environment configuration expectations for BamSignal. Variable details: [required-secrets.md](./required-secrets.md).

---

## Summary matrix

| Dimension | Local | Development | Preview | Staging | Production |
|-----------|-------|-------------|---------|---------|------------|
| **Purpose** | Engineer workstation | Shared dev testing | PR / branch preview | Pre-prod validation | Live users |
| **URL** | `localhost:5173` / `:3000` | Coolify dev URL | Preview URL | `staging.bamsignal.com` or Coolify | `https://bamsignal.com` |
| **Database** | Local Postgres or dev Supabase | Dev Supabase | Preview Supabase | Staging Supabase | **Production Supabase** |
| **Paystack** | `pk_test_` / `sk_test_` | Test keys | Test keys | Test or live (policy) | **`pk_live_` / `sk_live_`** |
| **Email** | Optional / mock | Resend test | Resend test | Resend | **Resend production** |
| **Migrations** | Manual | `RUN_MIGRATIONS_ON_STARTUP` | Optional | true | **true** |
| **Admin bootstrap** | Allowed (controlled) | Disabled | Disabled | Disabled | **Disabled** |
| **Android package** | `com.bamsignal.com` | Same | Same | Same | **`com.bamsignal.com`** |

---

## Local

| Field | Expected |
|-------|----------|
| **Node** | `npm run dev` (Vite) + optional `node server/production.js` |
| **Env file** | `.env` (gitignored) from `.env.example` |
| **Required** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (minimum for client) |
| **Paystack** | Test keys only |
| **PUBLIC_APP_URL** | `http://localhost:3000` or ngrok for payment testing |
| **Secrets in git** | **Never** |

---

## Development

| Field | Expected |
|-------|----------|
| **Deploy** | Optional Coolify dev service |
| **Integrations** | Dev Supabase project; test Paystack |
| **Feature flags** | `VITE_STORE_SCREENSHOTS=true` allowed |
| **Admin** | `ADMIN_BOOTSTRAP_ENABLED=false` unless controlled setup |

---

## Preview

| Field | Expected |
|-------|----------|
| **Purpose** | Branch deploys, QA snapshots |
| **URLs** | Must not use production domain |
| **Database** | Isolated preview project — **never production DB** |
| **Robots** | Block indexing |
| **Member UI** | Same build args pattern as production |

---

## Staging

| Field | Expected |
|-------|----------|
| **Purpose** | Full integration test before production |
| **Services** | All production-critical vars present |
| **Paystack** | Test keys recommended; live only with Finance approval |
| **Callback URLs** | Staging domain in `PAYSTACK_*_URL` vars |
| **Verification** | `ENV_TARGET=staging npm run env:validate -- --strict` |
| **Tests** | `npm run build`, `test:server-import`, manual QA |

---

## Production

| Field | Expected |
|-------|----------|
| **Platform** | Coolify Docker @ `https://bamsignal.com` |
| **PUBLIC_APP_URL** | `https://bamsignal.com` |
| **VITE_PUBLIC_APP_URL** | `https://bamsignal.com` (buildtime) |
| **Paystack callback** | `https://bamsignal.com/payment/success` |
| **Paystack webhook** | `https://bamsignal.com/api/paystack/webhook` |
| **Android callback** | `com.bamsignal.com://payment-success` |
| **Deep links** | `https://bamsignal.com/.well-known/assetlinks.json` |
| **Storage buckets** | Supabase `profile-photos`, `cover-photos` |
| **Package ID** | `com.bamsignal.com` |
| **Readiness** | `GET /ready` → 200 |

---

## Integration availability by environment

| Integration | Local | Dev | Preview | Staging | Production |
|-------------|-------|-----|---------|---------|------------|
| Supabase DB | ○ | ● | ● | ● | ● |
| Paystack | ○ | ● | ○ | ● | ● |
| Resend email | ○ | ● | ○ | ● | ● |
| SendChamp WhatsApp | — | ○ | — | ● | ● |
| Firebase push | — | ○ | ○ | ● | ● |
| Google Calendar | — | ○ | — | ● | ● |
| Zoom | — | ○ | — | ● | ● |
| Google Meet | — | ○ | — | ○ | ● |
| Signal Concierge (full) | — | ○ | ○ | ● | ● |
| Operations Center | — | ● | ○ | ● | ● |
| Executive Dashboard | — | ○ | — | ● | ● |

● required for parity testing · ○ optional · — not required

---

## URL and callback reference (production)

| Variable | Production value |
|----------|------------------|
| `PUBLIC_APP_URL` | `https://bamsignal.com` |
| `VITE_PUBLIC_APP_URL` | `https://bamsignal.com` |
| `PAYSTACK_CALLBACK_URL` | `https://bamsignal.com/payment/success` |
| `PAYSTACK_WEBHOOK_URL` | `https://bamsignal.com/api/paystack/webhook` |
| `PAYSTACK_ANDROID_CALLBACK_URL` | `com.bamsignal.com://payment-success` |
| `GOOGLE_REDIRECT_URI` | `https://bamsignal.com/api/calendar?action=oauth-callback` |
| SendChamp webhook | `https://bamsignal.com/api/verify/whatsapp/webhook` |

---

## Related

- [environment-promotion.md](./environment-promotion.md)
- [verification-checklist.md](./verification-checklist.md)
- [configuration-drift.md](./configuration-drift.md)
