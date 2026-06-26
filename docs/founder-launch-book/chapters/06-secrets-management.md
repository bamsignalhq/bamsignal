# Secrets Management

## Golden rules

1. **Never commit secrets** to git (including `.env`).
2. Store canonical values in a **password manager** + Coolify runtime env.
3. Buildtime Docker args: **public `VITE_*` only**.
4. Rotate using `docs/operations/environment/rotation-policy.md`.

## Canonical secret locations

| Secret | Runtime env | Notes |
|--------|-------------|-------|
| Postgres | `DATABASE_URL` | Supabase connection string |
| Supabase admin | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` | Signup email, admin ops |
| Paystack | `PAYSTACK_SECRET_KEY`, webhook secret | Live mode in production |
| Email | `RESEND_API_KEY` | Signup + purchase emails |
| OTP messaging | `SENDCHAMP_*` | WhatsApp/SMS if enabled |
| Firebase admin | `FIREBASE_SERVICE_ACCOUNT_JSON` | Push notifications |
| Diagnostics | `CRON_SECRET`, `DIAGNOSTICS_SECRET` | `/ready?details=1`, cron routes |
| Admin PIN | `COMMAND_CENTER_PIN`, `ADMIN_ACTION_PIN` | Hard console access |

Full list: `.env.example` and `docs/operations/environment/required-secrets.md`

## Duplicate / alias variables

Use canonical names only. Aliases must match or be unset:

- Paystack public: `VITE_PAYSTACK_PUBLIC_KEY`
- Supabase URL: `SUPABASE_URL` at runtime
- Service role: `SUPABASE_SERVICE_ROLE_KEY`

Drift detection: `npm run certify:drift`

## Access control

- Coolify: founder + designated DevOps only.
- Supabase: least-privilege dashboard users.
- Paystack: separate dashboard logins; webhook secret rotated on compromise.

## If a secret leaks

1. Rotate immediately in provider dashboard.
2. Update Coolify runtime env.
3. Restart container.
4. Record security incident (P1 if production exposed).
