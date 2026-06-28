# Environment Variable Classification

Enterprise startup tiers for BamSignal production.  
Source of truth for runtime behavior: `shared/environmentClassification.mjs`.

## CRITICAL

Server must **not** accept production traffic without these configured.

| Integration | Variables | Notes |
|-------------|-----------|-------|
| Database | `DATABASE_URL` | Postgres connection; must ping successfully for `/ready` |
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Auth, storage, admin operations |
| Application | `VITE_PUBLIC_APP_URL`, `PUBLIC_APP_URL` | Canonical public URL |
| Paystack | `PAYSTACK_SECRET_KEY`, `VITE_PAYSTACK_PUBLIC_KEY` | Payments enabled for all production releases |
| Command Center | `COMMAND_CENTER_PIN`, `COMMAND_CENTER_EMAILS` | Admin authentication |
| Operations | `CRON_SECRET` | Scheduled jobs and protected diagnostics |

**Auth tokens:** Member sessions use Supabase JWT — no separate `JWT_SECRET` or `SESSION_SECRET`.

## IMPORTANT

Server **may start**; affected product features are disabled until configured.

| Integration | Variables | Disabled when missing |
|-------------|-----------|----------------------|
| Resend Email | `RESEND_API_KEY` | Signup / transactional email |
| Sendchamp WhatsApp | `SENDCHAMP_API_KEY`, `SENDCHAMP_WHATSAPP_SENDER` | WhatsApp verification |
| Firebase Push | `FIREBASE_SERVICE_ACCOUNT_JSON` or discrete Firebase admin vars | Push notifications |
| Photo Storage | `SUPABASE_URL` + service role (shared with Supabase) | Member photo uploads |

## OPTIONAL

Feature disabled automatically; never blocks startup or `/ready`.

| Integration | Variables |
|-------------|-----------|
| Google Calendar | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` |
| Zoom | `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` |
| Google Meet | `GOOGLE_MEET_CLIENT_ID`, `GOOGLE_MEET_CLIENT_SECRET` |
| OpenAI | `OPENAI_API_KEY` |
| Telegram | `TELEGRAM_BOT_TOKEN` |

## DEVELOPMENT ONLY

Never required in production. Present only for local tooling.

- `ADMIN_BOOTSTRAP_*`, `LEGACY_SETUP_*`
- `CAP_SERVER_URL`, `VITE_STORE_SCREENSHOTS`
- `TELEGRAM_ENABLE_POLLING`
- Certification runner vars (`CERTIFICATION_*`, `ENV_TARGET`)
- Smoke/bootstrap flags (`BAMSIGNAL_STARTUP_MODE`, `BAMSIGNAL_SMOKE_*`)

## Execution modes

| Mode | When | Critical enforcement |
|------|------|---------------------|
| `smoke-import` | Docker module import | None |
| `smoke` | Docker/local HTTP smoke tests | None — `/ready` may return 503 |
| `development` | Local `npm run dev` | Log report; continue |
| `production` | `node server/production.js` in Coolify | Exit(1) before `listen()` if CRITICAL missing |
