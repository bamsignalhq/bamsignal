# Admin Operations Runbook

## Prerequisites

- Repository: bamsignalhq/bamsignal
- Supabase ref: nswiwxmavuqpuzlsascs
- Migration: `npm run migrate` (applies `0062_admin_operations_core.sql`)

## Admin Access

1. Authenticate via Supabase admin session or `x-admin-secret` automation header
2. Verify permissions: `POST /api/operations/admin?action=permissions`

## Dashboard

```
POST /api/operations/admin?action=dashboard
```

Returns platform health, moderation/support/concierge queues, revenue snapshot, certification status.

## Role Assignment

Super Admin only (requires `admin.roles.manage`):

```
POST /api/operations/admin?action=assign-role
{ "operatorEmail": "...", "roleSlug": "moderator", "reason": "..." }
```

## Incident Response

1. Enable maintenance mode: `update-runtime-config` with `configKey: maintenance_mode`
2. Review audit log: `action=audit-log`
3. Check admin events: `action=admin-events`
4. Monitor metrics: `action=metrics`

## Recovery

- All lifecycle tables are append-only
- Use `correlation_id` in audit log to trace related actions
- Safety actions never delete — use compensating actions (unsuspend, lift shadow ban)

## Certification

```bash
npm run certify:operations-journey
npm run generate:launch-readiness
```

## Escalation

| Domain | Escalate to |
|--------|-------------|
| Moderation | Platform Administrator |
| Support | Operations Administrator |
| Concierge | Operations Administrator |
| Finance | Finance Administrator |
| Trust | Trust Administrator |
