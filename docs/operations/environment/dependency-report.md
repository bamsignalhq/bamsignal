# Environment Dependency Report

**Target profile:** development
**Generated from:** `shared/environmentRegistry.mjs`

| Variable | Group | Required | Profiles | Where used |
|----------|-------|----------|----------|------------|
| `NODE_ENV` | application | mandatory | local, development, preview, staging, production | — |
| `PORT` | application | optional | local, development, preview, staging, production | — |
| `HOST` | application | optional | local, development, preview, staging, production | — |
| `PUBLIC_APP_URL` | application | mandatory | preview, staging, production | server/config.js; server/seoSitemap.js |
| `VITE_PUBLIC_APP_URL` | application | mandatory | local, development, preview, staging, production | — |
| `APP_TIMEZONE` | application | optional | staging, production | — |
| `RUN_MIGRATIONS_ON_STARTUP` | application | recommended | staging, production | — |
| `DATABASE_URL` | supabase | mandatory | local, development, staging, production | server/db.js; server/config.js… |
| `VITE_SUPABASE_URL` | supabase | mandatory | local, development, preview, staging, production | src/lib/supabaseClient.ts; server/supabaseEnv.js… |
| `VITE_SUPABASE_ANON_KEY` | supabase | mandatory | local, development, preview, staging, production | src/lib/supabaseClient.ts; server/supabaseEnv.js |
| `SUPABASE_URL` | supabase | mandatory | staging, production | server/supabaseEnv.js; server/services/photoStorage.js |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase | mandatory | staging, production | server/supabaseEnv.js; server/services/photoStorage.js… |
| `SUPABASE_ANON_KEY` | supabase | recommended | staging, production | server/services/photoStorage.js; api/member/photos.js |
| `COMMAND_CENTER_PIN` | authentication | mandatory | staging, production | server/services/productionSecurity.js; server/routes/admin.js |
| `COMMAND_CENTER_EMAILS` | authentication | mandatory | staging, production | server/services/productionSecurity.js |
| `ADMIN_BOOTSTRAP_ENABLED` | authentication | optional | local, development | — |
| `ADMIN_BOOTSTRAP_SECRET` | authentication | optional | local, development | — |
| `LEGACY_SETUP_ENABLED` | authentication | optional | local | — |
| `LEGACY_SETUP_SECRET` | authentication | optional | local | — |
| `PAYSTACK_SECRET_KEY` | payments | mandatory | staging, production | server/config.js; server/routes/paystack.js… |
| `VITE_PAYSTACK_PUBLIC_KEY` | payments | mandatory | local, development, preview, staging, production | src/services/payments.ts; server/config.js |
| `PAYSTACK_CALLBACK_URL` | payments | recommended | staging, production | — |
| `PAYSTACK_ANDROID_CALLBACK_URL` | payments | recommended | staging, production | — |
| `PAYSTACK_WEBHOOK_URL` | payments | recommended | staging, production | — |
| `PAYSTACK_WEBHOOK_SECRET` | payments | recommended | staging, production | — |
| `RESEND_API_KEY` | email | mandatory | staging, production | server/services/contactMail.js; server/services/signupOtp.js… |
| `SIGNUP_EMAIL_FROM` | email | recommended | staging, production | — |
| `SUPPORT_EMAIL_FROM` | email | recommended | staging, production | — |
| `CONCIERGE_EMAIL_FROM` | email | optional | production | — |
| `SUPPORT_EMAIL_TO` | email | optional | production | — |
| `VITE_SUPPORT_EMAIL` | email | optional | local, development, staging, production | — |
| `SENDCHAMP_API_KEY` | whatsapp | recommended | staging, production | server/services/sendchamp.js; server/config.js |
| `SENDCHAMP_SENDER` | whatsapp | recommended | staging, production | server/services/sendchamp.js |
| `SENDCHAMP_WHATSAPP_SENDER` | whatsapp | recommended | staging, production | server/services/sendchamp.js; api/verify/whatsapp/start.js |
| `SENDCHAMP_BASE_URL` | whatsapp | optional | staging, production | — |
| `GOOGLE_CLIENT_ID` | google-calendar | recommended | staging, production | server/config.js; server/routes/consultationScheduling.js |
| `GOOGLE_CLIENT_SECRET` | google-calendar | recommended | staging, production | server/config.js; server/routes/consultationScheduling.js |
| `GOOGLE_REDIRECT_URI` | google-calendar | recommended | staging, production | server/config.js |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | google-calendar | recommended | production | server/config.js; server/services/meetingInfrastructure.js |
| `GOOGLE_CALENDAR_ID` | google-calendar | optional | production | — |
| `ZOOM_CLIENT_ID` | zoom | recommended | staging, production | server/config.js; server/services/meetingInfrastructure.js |
| `ZOOM_CLIENT_SECRET` | zoom | recommended | staging, production | server/config.js |
| `ZOOM_ACCOUNT_ID` | zoom | recommended | production | server/config.js |
| `GOOGLE_MEET_CLIENT_ID` | google-meet | recommended | staging, production | server/config.js |
| `GOOGLE_MEET_CLIENT_SECRET` | google-meet | recommended | staging, production | server/config.js |
| `GOOGLE_MEET_REFRESH_TOKEN` | google-meet | recommended | production | server/config.js |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | storage | optional | staging, production | server/firebase.js; server/services/readiness.js |
| `VITE_FIREBASE_API_KEY` | notifications | optional | staging, production | src/firebase.ts; capacitor push (android) |
| `VITE_FIREBASE_AUTH_DOMAIN` | notifications | optional | staging, production | — |
| `VITE_FIREBASE_PROJECT_ID` | notifications | optional | staging, production | src/firebase.ts |
| `VITE_FIREBASE_STORAGE_BUCKET` | notifications | optional | staging, production | — |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | notifications | optional | staging, production | — |
| `VITE_FIREBASE_APP_ID` | notifications | optional | staging, production | — |
| `CRON_SECRET` | operations | mandatory | staging, production | server/services/diagnosticsAccess.js; server/routes/cron.js |
| `DIAGNOSTICS_SECRET` | operations | recommended | staging, production | — |
| `ADMIN_CONSENT_SECRET` | operations | optional | production | — |
| `VITE_ENABLE_REFERRALS_UI` | feature-flags | optional | local, development, staging, production | — |
| `VITE_ENABLE_IMAGE_MODERATION` | feature-flags | optional | staging, production | — |
| `VITE_PHOTO_MODERATION_MODE` | feature-flags | optional | staging, production | — |
| `PHOTO_MODERATION_MODE` | feature-flags | optional | staging, production | — |
| `VITE_STORE_SCREENSHOTS` | feature-flags | optional | local, development | — |
| `PAYSTACK_ANDROID_CALLBACK_URL` | android | recommended | production | — |
| `TELEGRAM_BOT_TOKEN` | analytics | optional | production | — |
| `TELEGRAM_ENABLE_POLLING` | analytics | optional | local, development | — |
| `OPENAI_API_KEY` | openai | optional | staging, production | src/constants/aiAssistedConsultant.ts; certification/chaos (optional) |
| `OPENAI_MODEL` | openai | optional | staging, production | — |
| `CERTIFICATION_BASE_URL` | certification | optional | local, development, staging, production | certification/e2e/config.mjs; certification/platform-load/config.mjs |
| `CERTIFICATION_EXECUTION_MODE` | certification | optional | local, development, staging, production | — |
| `ENV_TARGET` | certification | optional | local, development, staging, production | — |

## Profile summary

- **`.env.development`** — local engineering; DATABASE_URL optional (dry-run OK)
- **`.env.staging`** — full integration testing; all staging-critical vars required
- **`.env.production.example`** — production template; never commit real secrets

