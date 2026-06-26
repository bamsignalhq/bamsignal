# Environment Usage Report

Generated: 2026-06-26T23:40:22.610Z

Scanned **3623** files · **138** unique environment variables.

## Variable inventory

| Variable | Required | Scope | Default | Files |
|----------|----------|-------|---------|------:|
| `ACCESSIBILITY_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `ADMIN_ACTION_PIN` | critical | runtime | — | 1 |
| `ADMIN_BOOTSTRAP_EMAIL` | optional | runtime | ops@bamsignal.com | 2 |
| `ADMIN_BOOTSTRAP_ENABLED` | optional | runtime | false | 2 |
| `ADMIN_BOOTSTRAP_PASSWORD` | optional | runtime | — | 3 |
| `ADMIN_BOOTSTRAP_SECRET` | optional | runtime | — | 2 |
| `ADMIN_BOOTSTRAP_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `ADMIN_CONSENT_SECRET` | optional | runtime | — | 1 |
| `ADMIN_EMAILS` | critical | runtime | — | 1 |
| `ANDROID_KEYSTORE_SEARCH` | optional-tooling | runtime | — | 2 |
| `ANDROID_PREPARE_RESET_UPLOAD` | undocumented | runtime | — | 1 |
| `ANDROID_STUDIO_JBR` | optional-tooling | runtime | — | 1 |
| `APP_TIMEZONE` | optional | runtime | Africa/Lagos | 1 |
| `CAP_SERVER_URL` | optional | runtime | — | 1 |
| `CERTIFICATION_BASE_URL` | optional | runtime | https://bamsignal.com | 5 |
| `CERTIFICATION_CLEANUP` | optional-tooling | runtime | — | 1 |
| `CERTIFICATION_DIST_DIR` | optional-tooling | runtime | — | 1 |
| `CERTIFICATION_EMAIL_DOMAIN` | optional | runtime | cert.bamsignal.com | 2 |
| `CERTIFICATION_HEADLESS` | optional-tooling | runtime | — | 2 |
| `CERTIFICATION_OUTPUT_DIR` | optional-tooling | runtime | — | 1 |
| `CERTIFICATION_PERF_OUTPUT_DIR` | optional-tooling | runtime | — | 1 |
| `CERTIFICATION_SCREENSHOTS` | optional-tooling | runtime | — | 1 |
| `CERTIFICATION_TARGET` | undocumented | runtime | — | 1 |
| `CERTIFICATION_TIMEOUT_MS` | optional-tooling | runtime | — | 1 |
| `CHAOS_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `COMMAND_CENTER_EMAILS` | critical | runtime | — | 2 |
| `COMMAND_CENTER_PIN` | critical | runtime | — | 1 |
| `CONCIERGE_EMAIL_FROM` | optional | runtime | — | 1 |
| `CRON_SECRET` | critical | runtime | — | 10 |
| `DATA_INTEGRITY_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `DATABASE_PERF_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `DATABASE_URL` | critical | runtime | — | 5 |
| `DEPENDENCY_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `DEPLOY_ENV` | optional-tooling | runtime | — | 1 |
| `DIAGNOSTICS_SECRET` | warning | runtime | — | 3 |
| `DIAGNOSTICS_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `DRIFT_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `ENV_PROFILE` | undocumented | runtime | — | 1 |
| `ENV_TARGET` | optional | runtime | — | 2 |
| `ENV_VALIDATE_CONNECTIVITY` | undocumented | runtime | — | 1 |
| `FIREBASE_CLIENT_EMAIL` | optional | runtime | — | 1 |
| `FIREBASE_PRIVATE_KEY` | optional | runtime | — | 1 |
| `FIREBASE_PROJECT_ID` | optional | runtime | — | 1 |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | optional | runtime | — | 1 |
| `FOUNDER_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `GITHUB_SHA` | undocumented | runtime | — | 2 |
| `GOOGLE_CALENDAR_ID` | optional | runtime | primary | 1 |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | warning | runtime | — | 1 |
| `GOOGLE_CLIENT_ID` | warning | runtime | — | 1 |
| `GOOGLE_CLIENT_SECRET` | warning | runtime | — | 1 |
| `GOOGLE_MEET_CALENDAR_ID` | undocumented | runtime | primary | 1 |
| `GOOGLE_MEET_CLIENT_ID` | warning | runtime | — | 1 |
| `GOOGLE_MEET_CLIENT_SECRET` | warning | runtime | — | 1 |
| `GOOGLE_MEET_REFRESH_TOKEN` | warning | runtime | — | 1 |
| `GOOGLE_REDIRECT_URI` | warning | runtime | — | 1 |
| `HOME` | optional-tooling | runtime | — | 1 |
| `HOST` | optional | runtime | 0.0.0.0 | 2 |
| `IDENTITY_EXPOSURE_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `JAVA_HOME` | undocumented | runtime | — | 1 |
| `LEGACY_SETUP_ENABLED` | optional | runtime | false | 2 |
| `LEGACY_SETUP_SECRET` | optional | runtime | — | 2 |
| `LEGACY_SETUP_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `LOAD_CERT_BASE_URL` | undocumented | runtime | — | 1 |
| `LOAD_CERT_FAST` | undocumented | runtime | — | 1 |
| `LOAD_CERT_MAX_CONCURRENCY` | undocumented | runtime | — | 1 |
| `LOAD_CERT_PORT` | undocumented | runtime | — | 1 |
| `LOAD_CERT_READY_SAMPLE_MS` | undocumented | runtime | — | 1 |
| `LOAD_CERT_REQUEST_TIMEOUT_MS` | undocumented | runtime | — | 1 |
| `LOAD_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `LOAD_CERT_START_LOCAL` | undocumented | runtime | — | 1 |
| `LOAD_CERT_VIRTUAL_MEMBERS` | undocumented | runtime | — | 1 |
| `MEMBER_AUTH_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `NODE_ENV` | critical | runtime | development | 3 |
| `PATH` | undocumented | runtime | — | 1 |
| `PAYSTACK_ANDROID_CALLBACK_URL` | warning | runtime | com.bamsignal.com://payment-success | 1 |
| `PAYSTACK_CALLBACK_URL` | warning | runtime | — | 1 |
| `PAYSTACK_PUBLIC_KEY` | critical | runtime | — | 1 |
| `PAYSTACK_SECRET_KEY` | critical | runtime | — | 4 |
| `PAYSTACK_WEBHOOK_SECRET` | warning | runtime | — | 3 |
| `PAYSTACK_WEBHOOK_URL` | warning | runtime | — | 1 |
| `PENTEST_BASE_URL` | undocumented | runtime | — | 1 |
| `PENTEST_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `PENTEST_OTP_BURST` | undocumented | runtime | — | 1 |
| `PENTEST_PIN_BURST` | undocumented | runtime | — | 1 |
| `PENTEST_PORT` | undocumented | runtime | — | 1 |
| `PENTEST_REQUEST_TIMEOUT_MS` | undocumented | runtime | — | 1 |
| `PENTEST_START_LOCAL` | undocumented | runtime | — | 1 |
| `PGSSLMODE` | optional | runtime | disable (local only) | 2 |
| `PHOTO_ATTRIBUTION_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `PHOTO_MODERATION_MODE` | optional | runtime | upload_first | 2 |
| `PLAY_REVIEWER_PIN` | undocumented | runtime | — | 1 |
| `PLAY_UPLOAD_CERT_SHA1` | undocumented | runtime | — | 1 |
| `PORT` | optional | runtime | 3000 | 12 |
| `PUBLIC_APP_URL` | critical | runtime | https://bamsignal.com | 1 |
| `RATE_LIMIT_CLEANUP_INTERVAL_MS` | optional | runtime | — | 1 |
| `RC_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `READINESS_SMOKE_PORT` | undocumented | runtime | — | 1 |
| `RELIABILITY_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `RESEND_API_KEY` | critical | runtime | — | 8 |
| `RUN_MIGRATIONS_ON_STARTUP` | warning | runtime | true | 1 |
| `SECURITY_CERT_RUN_ID` | optional-tooling | runtime | — | 1 |
| `SENDCHAMP_API_KEY` | warning | runtime | — | 1 |
| `SENDCHAMP_BASE_URL` | optional | runtime | https://api.sendchamp.com/api/v1 | 1 |
| `SENDCHAMP_SENDER` | warning | runtime | — | 1 |
| `SENDCHAMP_TEST_CODE` | undocumented | runtime | — | 1 |
| `SENDCHAMP_WHATSAPP_SENDER` | warning | runtime | — | 1 |
| `SIGNUP_EMAIL_FROM` | warning | runtime | — | 5 |
| `SIGNUP_MATH_CHALLENGE_SECRET` | optional | runtime | — | 1 |
| `SMOKE_BASE_URL` | undocumented | runtime | — | 1 |
| `SMOKE_COMMIT_SHA` | undocumented | runtime | — | 1 |
| `SMOKE_DIAGNOSTICS_SECRET` | undocumented | runtime | — | 1 |
| `SMOKE_PORT` | optional-tooling | runtime | — | 8 |
| `SMOKE_RUN_ID` | optional-tooling | runtime | — | 1 |
| `SUPABASE_ANON_KEY` | warning | runtime | — | 2 |
| `SUPABASE_SECRET_KEY` | critical | runtime | — | 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | critical | runtime | — | 3 |
| `SUPABASE_URL` | critical | runtime | — | 3 |
| `SUPPORT_EMAIL_FROM` | warning | runtime | BamSignal <support@bamsignal.com> | 6 |
| `SUPPORT_EMAIL_TO` | optional | runtime | support@bamsignal.com | 1 |
| `TELEGRAM_BOT_TOKEN` | optional | runtime | — | 1 |
| `TELEGRAM_ENABLE_POLLING` | optional | runtime | false | 1 |
| `TELEGRAM_FREE_CHANNEL_ID` | optional | runtime | — | 1 |
| `TELEGRAM_VIP_GROUP_ID` | optional | runtime | — | 1 |
| `TELEGRAM_WEBHOOK_SECRET` | optional | runtime | — | 1 |
| `VITE_APP_BUILD_ID` | undocumented | buildtime | — | 2 |
| `VITE_APP_BUILD_TIME` | undocumented | buildtime | — | 1 |
| `VITE_ENABLE_IMAGE_MODERATION` | optional | buildtime | — | 1 |
| `VITE_ENABLE_REFERRALS_UI` | optional | buildtime | false | 1 |
| `VITE_PAYSTACK_PUBLIC_KEY` | critical | buildtime | — | 2 |
| `VITE_PHOTO_MODERATION_MODE` | optional | buildtime | upload_first | 1 |
| `VITE_PUBLIC_APP_URL` | critical | buildtime | — | 1 |
| `VITE_STORE_SCREENSHOTS` | optional | buildtime | — | 1 |
| `VITE_SUPABASE_ANON_KEY` | warning | buildtime | — | 5 |
| `VITE_SUPABASE_URL` | critical | buildtime | — | 5 |
| `VITE_SUPPORT_EMAIL` | optional | buildtime | support@bamsignal.com | 2 |
| `ZOOM_ACCOUNT_ID` | warning | runtime | — | 1 |
| `ZOOM_CLIENT_ID` | warning | runtime | — | 1 |
| `ZOOM_CLIENT_SECRET` | warning | runtime | — | 1 |

## Runtime references (detail)

### `ACCESSIBILITY_CERT_RUN_ID`

- `certification/accessibility/config.mjs`

### `ADMIN_ACTION_PIN`

- `server/consoleEnv.js`

### `ADMIN_BOOTSTRAP_EMAIL`

- `api/admin/bootstrap.js`
- `scripts/bootstrap-admin.mjs`

### `ADMIN_BOOTSTRAP_ENABLED`

- `scripts/test-admin-bootstrap.mjs`
- `server/services/adminBootstrapAccess.js`

### `ADMIN_BOOTSTRAP_PASSWORD`

- `api/admin/bootstrap.js`
- `scripts/bootstrap-admin.mjs`
- `server/services/adminBootstrap.js`

### `ADMIN_BOOTSTRAP_SECRET`

- `scripts/test-admin-bootstrap.mjs`
- `server/services/adminBootstrapAccess.js`

### `ADMIN_BOOTSTRAP_SMOKE_PORT`

- `scripts/test-admin-bootstrap.mjs`

### `ADMIN_CONSENT_SECRET`

- `server/adminConsent.js`

### `ADMIN_EMAILS`

- `server/consoleEnv.js`

### `ANDROID_KEYSTORE_SEARCH`

- `scripts/fix-android-play-signing.mjs`
- `scripts/scan-android-keystores.mjs`

### `ANDROID_PREPARE_RESET_UPLOAD`

- `scripts/build-android-release.mjs`

### `ANDROID_STUDIO_JBR`

- `scripts/build-android-release.mjs`

### `APP_TIMEZONE`

- `server/config.js`

### `CAP_SERVER_URL`

- `capacitor.config.ts`

### `CERTIFICATION_BASE_URL`

- `certification/e2e/config.mjs`
- `certification/penetration/config.mjs`
- `certification/performance/config.mjs`
- `certification/platform-load/config.mjs`
- `certification/production-smoke/config.mjs`

### `CERTIFICATION_CLEANUP`

- `certification/e2e/run.mjs`

### `CERTIFICATION_DIST_DIR`

- `certification/performance/config.mjs`

### `CERTIFICATION_EMAIL_DOMAIN`

- `certification/e2e/config.mjs`
- `server/services/certificationE2e.js`

### `CERTIFICATION_HEADLESS`

- `certification/e2e/config.mjs`
- `certification/performance/config.mjs`

### `CERTIFICATION_OUTPUT_DIR`

- `certification/e2e/config.mjs`

### `CERTIFICATION_PERF_OUTPUT_DIR`

- `certification/performance/config.mjs`

### `CERTIFICATION_SCREENSHOTS`

- `certification/e2e/config.mjs`

### `CERTIFICATION_TARGET`

- `scripts/validate-environment.mjs`

### `CERTIFICATION_TIMEOUT_MS`

- `certification/e2e/config.mjs`

### `CHAOS_CERT_RUN_ID`

- `certification/chaos/config.mjs`

### `COMMAND_CENTER_EMAILS`

- `scripts/test-shadow-ban-restore.mjs`
- `server/consoleEnv.js`

### `COMMAND_CENTER_PIN`

- `server/consoleEnv.js`

### `CONCIERGE_EMAIL_FROM`

- `server/services/conciergeEmailService.js`

### `CRON_SECRET`

- `api/auth/identity.js`
- `certification/e2e/config.mjs`
- `certification/production-smoke/config.mjs`
- `scripts/test-diagnostics-access.mjs`
- `scripts/test-signup-protection.mjs`
- `server/adminAuth.js`
- `server/adminConsent.js`
- `server/config.js`
- `server/services/diagnosticsAccess.js`
- `server/services/signupMathChallenge.js`

### `DATA_INTEGRITY_CERT_RUN_ID`

- `certification/data-integrity/config.mjs`

### `DATABASE_PERF_CERT_RUN_ID`

- `certification/database/config.mjs`

### `DATABASE_URL`

- `certification/e2e/config.mjs`
- `scripts/run-migrations.mjs`
- `server/config.js`
- `server/services/rateLimitRetention.js`
- `server/startupMigrations.js`

### `DEPENDENCY_CERT_RUN_ID`

- `certification/dependencies/config.mjs`

### `DEPLOY_ENV`

- `certification/release-candidate/lib/collect.mjs`

### `DIAGNOSTICS_SECRET`

- `certification/e2e/config.mjs`
- `certification/production-smoke/config.mjs`
- `server/services/diagnosticsAccess.js`

### `DIAGNOSTICS_SMOKE_PORT`

- `scripts/test-diagnostics-access.mjs`

### `DRIFT_CERT_RUN_ID`

- `certification/drift/config.mjs`

### `ENV_PROFILE`

- `scripts/validate-environment.mjs`

### `ENV_TARGET`

- `certification/release-candidate/lib/collect.mjs`
- `scripts/validate-environment.mjs`

### `ENV_VALIDATE_CONNECTIVITY`

- `scripts/validate-environment.mjs`

### `FIREBASE_CLIENT_EMAIL`

- `server/firebaseEnv.js`

### `FIREBASE_PRIVATE_KEY`

- `server/firebaseEnv.js`

### `FIREBASE_PROJECT_ID`

- `server/firebaseEnv.js`

### `FIREBASE_SERVICE_ACCOUNT_JSON`

- `server/firebaseEnv.js`

### `FOUNDER_CERT_RUN_ID`

- `certification/founder/config.mjs`

### `GITHUB_SHA`

- `certification/production-smoke/config.mjs`
- `vite.config.ts`

### `GOOGLE_CALENDAR_ID`

- `server/config.js`

### `GOOGLE_CALENDAR_REFRESH_TOKEN`

- `server/config.js`

### `GOOGLE_CLIENT_ID`

- `server/config.js`

### `GOOGLE_CLIENT_SECRET`

- `server/config.js`

### `GOOGLE_MEET_CALENDAR_ID`

- `server/config.js`

### `GOOGLE_MEET_CLIENT_ID`

- `server/config.js`

### `GOOGLE_MEET_CLIENT_SECRET`

- `server/config.js`

### `GOOGLE_MEET_REFRESH_TOKEN`

- `server/config.js`

### `GOOGLE_REDIRECT_URI`

- `server/config.js`

### `HOME`

- `scripts/fix-android-play-signing.mjs`

### `HOST`

- `server/config.js`
- `server/production.js`

### `IDENTITY_EXPOSURE_SMOKE_PORT`

- `scripts/test-identity-exposure.mjs`

### `JAVA_HOME`

- `scripts/build-android-release.mjs`

### `LEGACY_SETUP_ENABLED`

- `scripts/test-legacy-setup-hardening.mjs`
- `server/services/consoleSetupAccess.js`

### `LEGACY_SETUP_SECRET`

- `scripts/test-legacy-setup-hardening.mjs`
- `server/services/consoleSetupAccess.js`

### `LEGACY_SETUP_SMOKE_PORT`

- `scripts/test-legacy-setup-hardening.mjs`

### `LOAD_CERT_BASE_URL`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_FAST`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_MAX_CONCURRENCY`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_PORT`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_READY_SAMPLE_MS`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_REQUEST_TIMEOUT_MS`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_RUN_ID`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_START_LOCAL`

- `certification/platform-load/config.mjs`

### `LOAD_CERT_VIRTUAL_MEMBERS`

- `certification/platform-load/config.mjs`

### `MEMBER_AUTH_SMOKE_PORT`

- `scripts/test-member-data-auth.mjs`

### `NODE_ENV`

- `certification/release-candidate/lib/collect.mjs`
- `server/adminConsent.js`
- `server/config.js`

### `PATH`

- `scripts/build-android-release.mjs`

### `PAYSTACK_ANDROID_CALLBACK_URL`

- `server/config.js`

### `PAYSTACK_CALLBACK_URL`

- `server/config.js`

### `PAYSTACK_PUBLIC_KEY`

- `server/config.js`

### `PAYSTACK_SECRET_KEY`

- `certification/e2e/lib/paystack-cert.mjs`
- `server/adminConsent.js`
- `server/config.js`
- `server/services/signupMathChallenge.js`

### `PAYSTACK_WEBHOOK_SECRET`

- `certification/e2e/lib/paystack-cert.mjs`
- `server/config.js`
- `server/services/paystackConsultationService.js`

### `PAYSTACK_WEBHOOK_URL`

- `server/config.js`

### `PENTEST_BASE_URL`

- `certification/penetration/config.mjs`

### `PENTEST_CERT_RUN_ID`

- `certification/penetration/config.mjs`

### `PENTEST_OTP_BURST`

- `certification/penetration/config.mjs`

### `PENTEST_PIN_BURST`

- `certification/penetration/config.mjs`

### `PENTEST_PORT`

- `certification/penetration/config.mjs`

### `PENTEST_REQUEST_TIMEOUT_MS`

- `certification/penetration/config.mjs`

### `PENTEST_START_LOCAL`

- `certification/penetration/config.mjs`

### `PGSSLMODE`

- `server/db.js`
- `server/migrationRunner.js`

### `PHOTO_ATTRIBUTION_SMOKE_PORT`

- `scripts/test-photo-upload-attribution.mjs`

### `PHOTO_MODERATION_MODE`

- `scripts/test-photo-moderation-provider.mjs`
- `server/services/photoModerationProvider.js`

### `PLAY_REVIEWER_PIN`

- `scripts/provision-play-reviewer.mjs`

### `PLAY_UPLOAD_CERT_SHA1`

- `shared/androidPlayUploadCert.mjs`

### `PORT`

- `certification/penetration/lib/server.mjs`
- `certification/platform-load/lib/server.mjs`
- `scripts/smoke-server-import.mjs`
- `scripts/test-admin-bootstrap.mjs`
- `scripts/test-diagnostics-access.mjs`
- `scripts/test-identity-exposure.mjs`
- `scripts/test-legacy-setup-hardening.mjs`
- `scripts/test-member-data-auth.mjs`
- `scripts/test-photo-upload-attribution.mjs`
- `scripts/test-readiness-health.mjs`
- … +2 more

### `PUBLIC_APP_URL`

- `server/config.js`

### `RATE_LIMIT_CLEANUP_INTERVAL_MS`

- `server/services/rateLimitRetention.js`

### `RC_CERT_RUN_ID`

- `certification/release-candidate/config.mjs`

### `READINESS_SMOKE_PORT`

- `scripts/test-readiness-health.mjs`

### `RELIABILITY_CERT_RUN_ID`

- `certification/reliability/config.mjs`

### `RESEND_API_KEY`

- `server/services/accountSecurity.js`
- `server/services/conciergeEmailService.js`
- `server/services/contactMail.js`
- `server/services/pinReset.js`
- `server/services/purchaseEmail.js`
- `server/services/readiness.js`
- `server/services/signupOtp.js`
- `server/supabaseEnv.js`

### `RUN_MIGRATIONS_ON_STARTUP`

- `server/startupMigrations.js`

### `SECURITY_CERT_RUN_ID`

- `certification/security/config.mjs`

### `SENDCHAMP_API_KEY`

- `server/config.js`

### `SENDCHAMP_BASE_URL`

- `server/config.js`

### `SENDCHAMP_SENDER`

- `server/config.js`

### `SENDCHAMP_TEST_CODE`

- `scripts/test-sendchamp-whatsapp.mjs`

### `SENDCHAMP_WHATSAPP_SENDER`

- `server/config.js`

### `SIGNUP_EMAIL_FROM`

- `server/services/accountSecurity.js`
- `server/services/conciergeEmailService.js`
- `server/services/pinReset.js`
- `server/services/purchaseEmail.js`
- `server/services/signupOtp.js`

### `SIGNUP_MATH_CHALLENGE_SECRET`

- `server/services/signupMathChallenge.js`

### `SMOKE_BASE_URL`

- `certification/production-smoke/config.mjs`

### `SMOKE_COMMIT_SHA`

- `certification/production-smoke/config.mjs`

### `SMOKE_DIAGNOSTICS_SECRET`

- `certification/production-smoke/config.mjs`

### `SMOKE_PORT`

- `scripts/smoke-server-import.mjs`
- `scripts/test-admin-bootstrap.mjs`
- `scripts/test-diagnostics-access.mjs`
- `scripts/test-identity-exposure.mjs`
- `scripts/test-legacy-setup-hardening.mjs`
- `scripts/test-member-data-auth.mjs`
- `scripts/test-photo-upload-attribution.mjs`
- `scripts/test-readiness-health.mjs`

### `SMOKE_RUN_ID`

- `certification/production-smoke/config.mjs`

### `SUPABASE_ANON_KEY`

- `server/services/pinLogin.js`
- `server/supabaseEnv.js`

### `SUPABASE_SECRET_KEY`

- `server/supabaseEnv.js`

### `SUPABASE_SERVICE_ROLE_KEY`

- `scripts/provision-play-reviewer.mjs`
- `scripts/test-admin-bootstrap.mjs`
- `server/supabaseEnv.js`

### `SUPABASE_URL`

- `scripts/test-admin-bootstrap.mjs`
- `server/services/adminBootstrap.js`
- `server/supabaseEnv.js`

### `SUPPORT_EMAIL_FROM`

- `server/services/accountSecurity.js`
- `server/services/conciergeEmailService.js`
- `server/services/contactMail.js`
- `server/services/pinReset.js`
- `server/services/purchaseEmail.js`
- `server/services/signupOtp.js`

### `SUPPORT_EMAIL_TO`

- `server/services/contactMail.js`

### `TELEGRAM_BOT_TOKEN`

- `server/config.js`

### `TELEGRAM_ENABLE_POLLING`

- `server/production.js`

### `TELEGRAM_FREE_CHANNEL_ID`

- `server/config.js`

### `TELEGRAM_VIP_GROUP_ID`

- `server/config.js`

### `TELEGRAM_WEBHOOK_SECRET`

- `api/auth/identity.js`

### `VITE_APP_BUILD_ID`

- `scripts/sync-cache-version.mjs`
- `vite.config.ts`

### `VITE_APP_BUILD_TIME`

- `vite.config.ts`

### `VITE_ENABLE_IMAGE_MODERATION`

- `src/config/imageModeration.ts`

### `VITE_ENABLE_REFERRALS_UI`

- `src/constants/featureFlags.ts`

### `VITE_PAYSTACK_PUBLIC_KEY`

- `server/config.js`
- `src/config/paystack.ts`

### `VITE_PHOTO_MODERATION_MODE`

- `src/config/imageModeration.ts`

### `VITE_PUBLIC_APP_URL`

- `src/services/supabase.ts`

### `VITE_STORE_SCREENSHOTS`

- `src/App.tsx`

### `VITE_SUPABASE_ANON_KEY`

- `server/adminAuth.js`
- `server/adminConsent.js`
- `server/services/pinLogin.js`
- `server/supabaseEnv.js`
- `src/services/supabase.ts`

### `VITE_SUPABASE_URL`

- `server/adminAuth.js`
- `server/adminConsent.js`
- `server/services/adminBootstrap.js`
- `server/supabaseEnv.js`
- `src/services/supabase.ts`

### `VITE_SUPPORT_EMAIL`

- `server/services/contactMail.js`
- `src/constants/support.ts`

### `ZOOM_ACCOUNT_ID`

- `server/config.js`

### `ZOOM_CLIENT_ID`

- `server/config.js`

### `ZOOM_CLIENT_SECRET`

- `server/config.js`

## Unused registry variables

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `CERTIFICATION_EXECUTION_MODE`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

## Undocumented in registry

- `ADMIN_BOOTSTRAP_SMOKE_PORT`
- `ANDROID_PREPARE_RESET_UPLOAD`
- `CERTIFICATION_TARGET`
- `DIAGNOSTICS_SMOKE_PORT`
- `ENV_PROFILE`
- `ENV_VALIDATE_CONNECTIVITY`
- `GITHUB_SHA`
- `GOOGLE_MEET_CALENDAR_ID`
- `IDENTITY_EXPOSURE_SMOKE_PORT`
- `JAVA_HOME`
- `LEGACY_SETUP_SMOKE_PORT`
- `LOAD_CERT_BASE_URL`
- `LOAD_CERT_FAST`
- `LOAD_CERT_MAX_CONCURRENCY`
- `LOAD_CERT_PORT`
- `LOAD_CERT_READY_SAMPLE_MS`
- `LOAD_CERT_REQUEST_TIMEOUT_MS`
- `LOAD_CERT_START_LOCAL`
- `LOAD_CERT_VIRTUAL_MEMBERS`
- `MEMBER_AUTH_SMOKE_PORT`
- `PATH`
- `PENTEST_BASE_URL`
- `PENTEST_OTP_BURST`
- `PENTEST_PIN_BURST`
- `PENTEST_PORT`
- `PENTEST_REQUEST_TIMEOUT_MS`
- `PENTEST_START_LOCAL`
- `PHOTO_ATTRIBUTION_SMOKE_PORT`
- `PLAY_REVIEWER_PIN`
- `PLAY_UPLOAD_CERT_SHA1`
- `READINESS_SMOKE_PORT`
- `SENDCHAMP_TEST_CODE`
- `SMOKE_BASE_URL`
- `SMOKE_COMMIT_SHA`
- `SMOKE_DIAGNOSTICS_SECRET`
- `VITE_APP_BUILD_ID`
- `VITE_APP_BUILD_TIME`

## Legacy / deprecated

- `SUPABASE_SECRET_KEY` (legacy)
- `ADMIN_ACTION_PIN` (legacy)
- `ADMIN_EMAILS` (legacy)
- `ADMIN_ACTION_PIN` (deprecated)
- `ADMIN_EMAILS` (deprecated)
- `SUPABASE_SECRET_KEY` (deprecated)
