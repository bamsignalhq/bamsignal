# Operational Drift Certification™

**Run ID:** drf-34f98377  
**Generated:** 2026-06-27T23:02:58.864Z  
**Mode:** static  
**Drift score:** 0%  
**Release gate:** BLOCKED

## Summary

| Metric | Value |
|--------|------:|
| Unexpected drift | 1 |
| Unauthorized changes | 0 |
| Configuration mismatches | 0 |
| Missing secrets | 14 |
| Unused secrets | 0 |

## Domains

| Domain | Findings | Critical | Status |
|--------|----------:|---------:|--------|
| Environment variables | 0 | 0 | PASS |
| Feature Flags | 1 | 0 | PASS |
| Remote Config | 2 | 0 | PASS |
| Permissions | 1 | 0 | PASS |
| Roles | 1 | 0 | PASS |
| Notification templates | 1 | 0 | PASS |
| Payment configuration | 5 | 5 | FAIL |
| Sendchamp | 1 | 0 | PASS |
| Resend | 1 | 0 | PASS |
| Firebase | 1 | 0 | PASS |
| Supabase | 7 | 7 | FAIL |
| Storage buckets | 1 | 0 | PASS |
| Cron schedules | 2 | 1 | FAIL |

## Open findings

| Domain | Title | Severity | Compare | Detail |
|--------|-------|----------|---------|--------|
| supabase | Missing secret | critical | production | DATABASE_URL required for production but unset. |
| supabase | Missing secret | critical | production | SUPABASE_URL required for production but unset. |
| supabase | Missing secret | critical | production | SUPABASE_SERVICE_ROLE_KEY required for production but unset. |
| authentication | Missing secret | critical | production | COMMAND_CENTER_PIN required for production but unset. |
| payment-configuration | Missing secret | critical | production | PAYSTACK_SECRET_KEY required for production but unset. |
| payment-configuration | Missing secret | critical | production | VITE_PAYSTACK_PUBLIC_KEY required for production but unset. |
| operations | Missing secret | critical | production | CRON_SECRET required for production but unset. |
| supabase | Missing secret | critical | staging | DATABASE_URL required for staging but unset. |
| supabase | Missing secret | critical | staging | SUPABASE_URL required for staging but unset. |
| supabase | Missing secret | critical | staging | SUPABASE_SERVICE_ROLE_KEY required for staging but unset. |
| authentication | Missing secret | critical | staging | COMMAND_CENTER_PIN required for staging but unset. |
| payment-configuration | Missing secret | critical | staging | PAYSTACK_SECRET_KEY required for staging but unset. |
| payment-configuration | Missing secret | critical | staging | VITE_PAYSTACK_PUBLIC_KEY required for staging but unset. |
| operations | Missing secret | critical | staging | CRON_SECRET required for staging but unset. |
| payment-configuration | Paystack secret missing | critical | current | PAYSTACK_SECRET_KEY not set in current environment. |
| sendchamp | Sendchamp not configured | warning | current | SENDCHAMP_API_KEY unset — WhatsApp channel may be degraded. |
| firebase | Firebase configuration incomplete | warning | current | Only 0/4 Firebase variables configured. |
| supabase | Supabase configuration gap | critical | current | Missing: SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL. |
| storage-buckets | Storage bucket unset | warning | current | VITE_FIREBASE_STORAGE_BUCKET not configured. |
| cron-schedules | Cron secret missing | critical | current | CRON_SECRET unset — scheduled job authentication may fail. |

## Unused secrets

- None

## Recommendations

- [critical] Missing secret: DATABASE_URL required for production but unset.
- [critical] Missing secret: SUPABASE_URL required for production but unset.
- [critical] Missing secret: SUPABASE_SERVICE_ROLE_KEY required for production but unset.
- [critical] Missing secret: COMMAND_CENTER_PIN required for production but unset.
- [critical] Missing secret: PAYSTACK_SECRET_KEY required for production but unset.
- [critical] Missing secret: VITE_PAYSTACK_PUBLIC_KEY required for production but unset.
- [critical] Missing secret: CRON_SECRET required for production but unset.
- [critical] Missing secret: DATABASE_URL required for staging but unset.
- [critical] Missing secret: SUPABASE_URL required for staging but unset.
- [critical] Missing secret: SUPABASE_SERVICE_ROLE_KEY required for staging but unset.
- [critical] Missing secret: COMMAND_CENTER_PIN required for staging but unset.
- [critical] Missing secret: PAYSTACK_SECRET_KEY required for staging but unset.
- [critical] Missing secret: VITE_PAYSTACK_PUBLIC_KEY required for staging but unset.
- [critical] Missing secret: CRON_SECRET required for staging but unset.
- [critical] Paystack secret missing: PAYSTACK_SECRET_KEY not set in current environment.
- [critical] Supabase configuration gap: Missing: SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL.
- [critical] Cron secret missing: CRON_SECRET unset — scheduled job authentication may fail.

---
Command: `npm run certify:drift`
