# Incident Response

Severity definitions align with `docs/operations/monitoring/incident-escalation.md`.

## Severity summary

| Level | Name | Example | Acknowledge |
|-------|------|---------|-------------|
| P1 | Critical | Site down, data loss risk | < 15 min |
| P2 | High | Payments broken, signup email down | < 30 min |
| P3 | Medium | Admin tab broken, workaround exists | < 4 hours |
| P4 | Low | Copy typo, log noise | Next business day |

## P1 playbook (site down)

1. Coolify → container status + logs.
2. Check `GET /ready` and `GET /health`.
3. Recent deploy? → rollback (see **Rollback Procedure**).
4. DB issue? → Supabase status + `DATABASE_URL`.
5. Assign Incident Commander; founder notified within 30 min.
6. Post-incident record mandatory within 5 business days.

## P1 playbook (payment incident)

1. Paystack dashboard — transaction state.
2. Query `payment_fulfillments` by reference.
3. Follow `docs/runbooks/payment-recovery.md`.
4. Confirm entitlement + purchase email sent once.

## P1 playbook (auth spike)

1. Search logs: `pin_login_failed`, `pin_login_locked`.
2. Restore DB if `throttle_db_unavailable`.
3. Do **not** disable throttle without security review.

## Incident record

Use `docs/releases/templates/incident-template.md`. Store under `docs/releases/incidents/`.

## Postmortem requirements

P1: required. P2: recommended. Include timeline, root cause, corrective actions, and whether rollback was used.
