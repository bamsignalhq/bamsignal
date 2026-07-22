# Authentication Operations Runbook — Sprint 2

Operational procedures for authentication, sessions, devices, recovery, and account lifecycle.

## Prerequisites

- Migration `0058_member_auth_lifecycle.sql` applied
- `npm run verify:migrations` PASS
- Schema verification includes auth lifecycle tables

## Health Checks

```bash
curl -s https://bamsignal.com/health
curl -s https://bamsignal.com/ready
```

Detailed readiness (requires diagnostics secret):

```bash
curl -s -H "x-diagnostics-secret: $DIAGNOSTICS_SECRET" \
  "https://bamsignal.com/ready?details=1"
```

Auth metrics appear in operator dashboard snapshot under `observability.auth`.

## Common Operations

### Inspect member lifecycle (SQL)

```sql
select previous_status, new_status, reason_code, reason, actor, occurred_at
from member_account_lifecycle_log
where profile_id = '<profile-uuid>'
order by occurred_at desc
limit 20;
```

### Inspect auth security events (SQL)

```sql
select event_type, summary, reason_code, occurred_at
from member_auth_security_events
where profile_id = '<profile-uuid>'
order by occurred_at desc
limit 50;
```

### List active sessions (SQL)

```sql
select session_id, device_name, platform, ip, last_activity_at, status
from member_auth_sessions
where profile_id = '<profile-uuid>' and status = 'active'
order by last_activity_at desc;
```

### Revoke all sessions for user (SQL — emergency)

```sql
update member_auth_sessions
set status = 'revoked', revoked_at = now(), revocation_reason = 'operator_revoke'
where auth_user_id = '<auth-user-uuid>' and status = 'active';
```

Prefer member API `POST /api/auth/sessions` action `revoke-all` when member token available.

## Account Deletion

1. Member initiates soft delete → `deleted_pending`, 30-day grace
2. Cron processes expired deletions → `processExpiredAccountDeletions()`
3. Retention metadata in `member_account_retention`

**Restore within grace:** member `restore-account` action (existing member data API).

## PIN Lockout

- Throttle: `pin_auth_attempts` + memory fallback (`PIN_AUTH_*` env vars)
- Locked users receive HTTP 429 on login
- Lock clears on successful login (`recordPinLoginSuccess`)

## Recovery

| Flow | Endpoint | Audit |
|------|----------|-------|
| Forgot PIN | `/api/auth/pin-reset` | `member_auth_recovery_tokens` + security events |
| Forgot username | `/api/auth/forgot-username` | Security events (future: recovery tokens) |

## Incident Response

### Spike in failed logins

1. Check `member_auth_security_events` where `event_type = 'failed_login'`
2. Review rate limit / PIN throttle metrics
3. Confirm no credential stuffing pattern by IP

### Session revocation after compromise

1. Revoke all sessions (SQL or member API)
2. Force PIN reset via existing flow
3. Review `member_auth_devices` for unknown devices

## Certification

```bash
npm run certify:migrations
npm run certify:production
```

Manifest artifacts:

- `certification/production/reports/manifest.json`
- `certification/production/reports/manifest.md`

## Validation Suite

```bash
npm run lint
npm run typecheck
npm run build
npm run test:server-import
node scripts/test-auth-lifecycle.mjs
npm run certify:migrations
npm run certify:production
```

## Escalation

- Database migration failures → verify Supabase ref `nswiwxmavuqpuzlsascs`
- Auth outages with DB down → PIN throttle uses memory fallback; admin PIN fails closed
- Do not manually edit `auth.users` without audit trail
