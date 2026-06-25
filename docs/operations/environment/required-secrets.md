# Required Secrets & Environment Variables

Inventory of BamSignal environment variables. **Names only** — store values in Coolify and password manager, never in git.

Registry implementation: `shared/environmentRegistry.mjs`  
Admin audit UI: `/hard/production-environment` (Production Environment Audit)

**Legend:** **C** = critical · **W** = warning (required for full features) · **O** = optional

---

## Application

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `NODE_ENV` | C | runtime | Node environment | Engineering |
| `PORT` | O | runtime | HTTP port (default 3000) | Engineering |
| `HOST` | O | runtime | Bind address | Engineering |
| `PUBLIC_APP_URL` | C | runtime | Server callbacks, payment return | Engineering |
| `VITE_PUBLIC_APP_URL` | C | buildtime | Client-side absolute URLs | Engineering |
| `APP_TIMEZONE` | O | runtime | Default `Africa/Lagos` | Engineering |
| `RUN_MIGRATIONS_ON_STARTUP` | W | runtime | Auto-run `migrations/` on boot | Engineering |

---

## Supabase

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `DATABASE_URL` | C | runtime | Postgres connection (`/ready`) | Engineering |
| `VITE_SUPABASE_URL` | C | buildtime | Client Supabase project URL | Engineering |
| `VITE_SUPABASE_ANON_KEY` | C | buildtime | Client anon key | Engineering |
| `SUPABASE_URL` | C | runtime | Server Supabase URL (prefer over VITE at runtime) | Engineering |
| `SUPABASE_SERVICE_ROLE_KEY` | C | runtime | Signup email, storage, admin | Engineering |
| `SUPABASE_ANON_KEY` | W | runtime | Photo upload JWT verify | Engineering |
| `SUPABASE_SECRET_KEY` | — | runtime | Legacy alias → use `SUPABASE_SERVICE_ROLE_KEY` | Engineering |
| `PGSSLMODE` | O | runtime | `disable` for local Postgres only | Engineering |

**Validation:** `VITE_SUPABASE_URL` and `SUPABASE_URL` must match in production.

---

## Authentication

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `COMMAND_CENTER_PIN` | C | runtime | Admin destructive action PIN | Security |
| `COMMAND_CENTER_EMAILS` | C | runtime | Operator allowlist | Security |
| `ADMIN_BOOTSTRAP_ENABLED` | O | runtime | One-time console setup (default false) | Security |
| `ADMIN_BOOTSTRAP_SECRET` | O | runtime | Bootstrap API header secret | Security |
| `ADMIN_BOOTSTRAP_EMAIL` | O | runtime | Bootstrap operator email | Security |
| `ADMIN_BOOTSTRAP_PASSWORD` | O | runtime | Bootstrap operator password | Security |
| `LEGACY_SETUP_ENABLED` | O | runtime | Legacy setup route (default false) | Security |
| `LEGACY_SETUP_SECRET` | O | runtime | Legacy setup header | Security |

Member auth uses username + PIN — no email/password login env vars.

---

## Payments (Paystack)

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `PAYSTACK_SECRET_KEY` | C | runtime | Server Paystack API (`sk_live_` prod) | Finance Ops |
| `VITE_PAYSTACK_PUBLIC_KEY` | C | buildtime | Client checkout (`pk_live_` prod) | Finance Ops |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | — | buildtime | Alias — use `VITE_PAYSTACK_PUBLIC_KEY` | Finance Ops |
| `PAYSTACK_PUBLIC_KEY` | — | runtime | Server fallback for public key | Finance Ops |
| `PAYSTACK_CALLBACK_URL` | W | runtime | Web payment return path | Finance Ops |
| `PAYSTACK_ANDROID_CALLBACK_URL` | W | runtime | Native payment return | Finance Ops |
| `PAYSTACK_WEBHOOK_URL` | W | runtime | Paystack dashboard webhook URL | Finance Ops |
| `PAYSTACK_WEBHOOK_SECRET` | W | runtime | Webhook HMAC (falls back to secret key) | Finance Ops |

---

## Email (Resend)

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `RESEND_API_KEY` | C | runtime | Transactional email (`/ready` signup) | Engineering |
| `SIGNUP_EMAIL_FROM` | W | runtime | Signup verification sender | Engineering |
| `SUPPORT_EMAIL_FROM` | W | runtime | Contact form sender | Engineering |
| `CONCIERGE_EMAIL_FROM` | O | runtime | Concierge emails | Operations |
| `SUPPORT_EMAIL_TO` | O | runtime | Contact form recipient | Operations |
| `VITE_SUPPORT_EMAIL` | O | buildtime | Public support address in UI | Engineering |

---

## WhatsApp (SendChamp)

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `SENDCHAMP_API_KEY` | W | runtime | SendChamp API | Operations |
| `SENDCHAMP_SENDER` | W | runtime | SMS sender ID | Operations |
| `SENDCHAMP_WHATSAPP_SENDER` | W | runtime | WhatsApp sender | Operations |
| `SENDCHAMP_BASE_URL` | O | runtime | API base URL | Engineering |
| `SENDCHAMP_WHATSAPP_TEMPLATE_*` | W | runtime | Approved template codes (5 templates) | Operations |

---

## Google Calendar

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `GOOGLE_CLIENT_ID` | W | runtime | OAuth client | Operations |
| `GOOGLE_CLIENT_SECRET` | W | runtime | OAuth secret | Operations |
| `GOOGLE_REDIRECT_URI` | W | runtime | OAuth callback | Operations |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | W | runtime | Server calendar access | Operations |
| `GOOGLE_CALENDAR_ID` | O | runtime | Calendar ID (default `primary`) | Operations |

---

## Zoom

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `ZOOM_CLIENT_ID` | W | runtime | Zoom OAuth | Operations |
| `ZOOM_CLIENT_SECRET` | W | runtime | Zoom OAuth secret | Operations |
| `ZOOM_ACCOUNT_ID` | W | runtime | Server-to-server OAuth | Operations |

---

## Google Meet

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `GOOGLE_MEET_CLIENT_ID` | W | runtime | Meet OAuth | Operations |
| `GOOGLE_MEET_CLIENT_SECRET` | W | runtime | Meet OAuth secret | Operations |
| `GOOGLE_MEET_REFRESH_TOKEN` | W | runtime | Meet link generation | Operations |
| `GOOGLE_MEET_CALENDAR_ID` | O | runtime | Calendar for Meet events | Operations |

---

## Storage & notifications (Firebase)

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | O | runtime | FCM push (server) | Engineering |
| `FIREBASE_PROJECT_ID` | O | runtime | Discrete Firebase vars (alt) | Engineering |
| `FIREBASE_CLIENT_EMAIL` | O | runtime | Discrete Firebase vars | Engineering |
| `FIREBASE_PRIVATE_KEY` | O | runtime | Discrete Firebase vars | Engineering |
| `VITE_FIREBASE_*` (6 vars) | O | buildtime | Client FCM config | Engineering |

Photo storage uses Supabase buckets — not Firebase Storage env vars.

---

## Operations & security secrets

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `CRON_SECRET` | C | runtime | Cron route auth | Security |
| `DIAGNOSTICS_SECRET` | W | runtime | `/ready?details=1`, diagnostics API | Security |
| `ADMIN_CONSENT_SECRET` | O | runtime | Admin consent HMAC | Security |
| `TELEGRAM_BOT_TOKEN` | O | runtime | Ops notifications | Engineering |
| `TELEGRAM_WEBHOOK_SECRET` | O | runtime | Telegram webhook | Engineering |

---

## Feature flags (see [feature-flags.md](./feature-flags.md))

| Variable | C/W/O | Scope | Purpose | Owner |
|----------|-------|-------|---------|-------|
| `VITE_ENABLE_REFERRALS_UI` | O | buildtime | Referral widget on home | Product |
| `VITE_ENABLE_IMAGE_MODERATION` | O | buildtime | Client moderation hints | Engineering |
| `VITE_PHOTO_MODERATION_MODE` | O | buildtime | Client mode mirror | Engineering |
| `PHOTO_MODERATION_MODE` | O | runtime | Server moderation authority | Engineering |
| `VITE_STORE_SCREENSHOTS` | O | buildtime | Store screenshot mode (dev only) | Engineering |

---

## Android / PWA / deep links

Not env vars but must stay aligned — validated manually and in [release checklists](../../releases/checklists/).

| Config | Location | Production |
|--------|----------|------------|
| Package ID | `android/app/build.gradle` | `com.bamsignal.com` |
| Deep link scheme | `AndroidManifest.xml` | `com.bamsignal.com://payment-success` |
| App Links | `assetlinks.json` | Play signing cert SHA-256 |
| PWA cache | `public/sw.js` | Synced on release |

---

## Future AI workspace

| Variable | C/W/O | Purpose | Owner |
|----------|-------|---------|-------|
| TBD | O | LLM provider API key | Engineering |
| TBD | O | Rate limit / audit config | Security |

Document here when AI workspace ships.

---

## Related

- [rotation-policy.md](./rotation-policy.md)
- [verification-checklist.md](./verification-checklist.md)
- [`.env.example`](../../../.env.example)
