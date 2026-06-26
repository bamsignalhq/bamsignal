# Environment Cleanup Report

Generated: 2026-06-26T23:40:22.610Z

## Variables to keep (73)

- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_ENABLED`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `ADMIN_BOOTSTRAP_SECRET`
- `ADMIN_CONSENT_SECRET`
- `APP_TIMEZONE`
- `CAP_SERVER_URL`
- `CERTIFICATION_BASE_URL`
- `CERTIFICATION_EMAIL_DOMAIN`
- `COMMAND_CENTER_EMAILS`
- `COMMAND_CENTER_PIN`
- `CONCIERGE_EMAIL_FROM`
- `CRON_SECRET`
- `DATABASE_URL`
- `DIAGNOSTICS_SECRET`
- `ENV_TARGET`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDAR_REFRESH_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_MEET_CLIENT_ID`
- `GOOGLE_MEET_CLIENT_SECRET`
- `GOOGLE_MEET_REFRESH_TOKEN`
- `GOOGLE_REDIRECT_URI`
- `HOST`
- `LEGACY_SETUP_ENABLED`
- `LEGACY_SETUP_SECRET`
- `NODE_ENV`
- `PAYSTACK_ANDROID_CALLBACK_URL`
- `PAYSTACK_CALLBACK_URL`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `PAYSTACK_WEBHOOK_URL`
- `PGSSLMODE`
- `PHOTO_MODERATION_MODE`
- `PORT`
- `PUBLIC_APP_URL`
- `RATE_LIMIT_CLEANUP_INTERVAL_MS`
- `RESEND_API_KEY`
- `RUN_MIGRATIONS_ON_STARTUP`
- `SENDCHAMP_API_KEY`
- `SENDCHAMP_BASE_URL`
- `SENDCHAMP_SENDER`
- `SENDCHAMP_WHATSAPP_SENDER`
- `SIGNUP_EMAIL_FROM`
- … +23 more

## Variables to delete

- `VITE_FIREBASE_API_KEY` — in registry but not referenced in code
- `VITE_FIREBASE_AUTH_DOMAIN` — in registry but not referenced in code
- `VITE_FIREBASE_PROJECT_ID` — in registry but not referenced in code
- `VITE_FIREBASE_STORAGE_BUCKET` — in registry but not referenced in code
- `VITE_FIREBASE_MESSAGING_SENDER_ID` — in registry but not referenced in code
- `VITE_FIREBASE_APP_ID` — in registry but not referenced in code
- `OPENAI_API_KEY` — in registry but not referenced in code
- `OPENAI_MODEL` — in registry but not referenced in code
- `CERTIFICATION_EXECUTION_MODE` — in registry but not referenced in code
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — in registry but not referenced in code

## Variables to rename

| From | To | Reason |
|------|-----|--------|
| `SUPABASE_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | legacy alias — remove from Coolify after migration |
| `ADMIN_ACTION_PIN` | `COMMAND_CENTER_PIN` | deprecated alias |
| `ADMIN_EMAILS` | `COMMAND_CENTER_EMAILS` | deprecated alias |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `VITE_PAYSTACK_PUBLIC_KEY` | portability alias only |

## Variables to rotate

| Variable | Policy | Required |
|----------|--------|----------|
| `DATABASE_URL` | on-compromise | critical |
| `VITE_SUPABASE_ANON_KEY` | supabase-rotate | critical |
| `SUPABASE_SERVICE_ROLE_KEY` | quarterly | critical |
| `SUPABASE_ANON_KEY` | supabase-rotate | warning |
| `COMMAND_CENTER_PIN` | quarterly | critical |
| `COMMAND_CENTER_EMAILS` | on-personnel-change | critical |
| `SIGNUP_MATH_CHALLENGE_SECRET` | quarterly | optional |
| `PAYSTACK_SECRET_KEY` | on-compromise | critical |
| `PAYSTACK_WEBHOOK_SECRET` | on-compromise | warning |
| `RESEND_API_KEY` | annual | critical |
| `SENDCHAMP_API_KEY` | annual | warning |
| `GOOGLE_CLIENT_ID` | annual | warning |
| `GOOGLE_CLIENT_SECRET` | annual | warning |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | oauth-refresh | warning |
| `ZOOM_CLIENT_ID` | annual | warning |
| `ZOOM_CLIENT_SECRET` | annual | warning |
| `GOOGLE_MEET_CLIENT_ID` | annual | warning |
| `GOOGLE_MEET_CLIENT_SECRET` | annual | warning |
| `GOOGLE_MEET_REFRESH_TOKEN` | oauth-refresh | warning |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | on-compromise | optional |
| `FIREBASE_PRIVATE_KEY` | on-compromise | optional |
| `CRON_SECRET` | quarterly | critical |
| `DIAGNOSTICS_SECRET` | quarterly | warning |
| `ADMIN_CONSENT_SECRET` | quarterly | optional |
| `TELEGRAM_BOT_TOKEN` | on-compromise | optional |
| `TELEGRAM_WEBHOOK_SECRET` | on-compromise | optional |
| `OPENAI_API_KEY` | on-compromise | optional |

## Duplicate groups — undefined behaviour risk

### paystack-public-key
- Canonical: `VITE_PAYSTACK_PUBLIC_KEY`
- Referenced: `VITE_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_PUBLIC_KEY`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

### supabase-url
- Canonical: `SUPABASE_URL`
- Referenced: `SUPABASE_URL`, `VITE_SUPABASE_URL`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

### supabase-anon-key
- Canonical: `SUPABASE_ANON_KEY`
- Referenced: `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

### supabase-service-key
- Canonical: `SUPABASE_SERVICE_ROLE_KEY`
- Referenced: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

### public-app-url
- Canonical: `PUBLIC_APP_URL`
- Referenced: `PUBLIC_APP_URL`, `VITE_PUBLIC_APP_URL`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

### command-center-pin
- Canonical: `COMMAND_CENTER_PIN`
- Referenced: `COMMAND_CENTER_PIN`, `ADMIN_ACTION_PIN`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

### command-center-emails
- Canonical: `COMMAND_CENTER_EMAILS`
- Referenced: `COMMAND_CENTER_EMAILS`, `ADMIN_EMAILS`
- Risk: Multiple aliases read with fallback — mismatched values cause client/server drift or auth failures

## Staging equivalents required

- `NODE_ENV` (critical)
- `PUBLIC_APP_URL` (critical)
- `VITE_PUBLIC_APP_URL` (critical)
- `RUN_MIGRATIONS_ON_STARTUP` (warning)
- `DATABASE_URL` (critical)
- `VITE_SUPABASE_URL` (critical)
- `VITE_SUPABASE_ANON_KEY` (critical)
- `SUPABASE_URL` (critical)
- `SUPABASE_SERVICE_ROLE_KEY` (critical)
- `SUPABASE_ANON_KEY` (warning)
- `COMMAND_CENTER_PIN` (critical)
- `COMMAND_CENTER_EMAILS` (critical)
- `PAYSTACK_SECRET_KEY` (critical)
- `VITE_PAYSTACK_PUBLIC_KEY` (critical)
- `PAYSTACK_CALLBACK_URL` (warning)
- `PAYSTACK_ANDROID_CALLBACK_URL` (warning)
- `PAYSTACK_WEBHOOK_URL` (warning)
- `PAYSTACK_WEBHOOK_SECRET` (warning)
- `RESEND_API_KEY` (critical)
- `SIGNUP_EMAIL_FROM` (warning)
- `SUPPORT_EMAIL_FROM` (warning)
- `SENDCHAMP_API_KEY` (warning)
- `SENDCHAMP_SENDER` (warning)
- `SENDCHAMP_WHATSAPP_SENDER` (warning)
- `GOOGLE_CLIENT_ID` (warning)
- `GOOGLE_CLIENT_SECRET` (warning)
- `GOOGLE_REDIRECT_URI` (warning)
- `ZOOM_CLIENT_ID` (warning)
- `ZOOM_CLIENT_SECRET` (warning)
- `GOOGLE_MEET_CLIENT_ID` (warning)
- `GOOGLE_MEET_CLIENT_SECRET` (warning)
- `CRON_SECRET` (critical)
- `DIAGNOSTICS_SECRET` (warning)
