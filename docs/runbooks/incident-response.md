# Incident response runbook

**Index for production incidents.** Detailed severity matrix: [incident-escalation.md](../operations/monitoring/incident-escalation.md).  
Scenario playbooks: [runbooks.md](../operations/monitoring/runbooks.md).

---

## First 15 minutes (any P1)

1. **Acknowledge** — assign Incident Commander.
2. **Triage** — `/health`, `/ready`, Coolify container status.
3. **Communicate** — founder notified for P1 within 30 min.
4. **Mitigate** — rollback, restart, or failover per scenario below.
5. **Document** — incident template in `docs/releases/templates/incident-template.md`.

---

## Scenario routing

| Scenario | Runbook |
|----------|---------|
| Site down / 502 / 503 | [deployment-recovery.md](./deployment-recovery.md) |
| Database down | [database-restore.md](./database-restore.md) |
| Payments broken | [payment-recovery.md](./payment-recovery.md) |
| Wallet / BayGold | [wallet-recovery.md](./wallet-recovery.md) |
| Email / push down | [notification-recovery.md](./notification-recovery.md) |
| Messaging broken | [messaging-recovery.md](./messaging-recovery.md) |
| Photos missing | [storage-restore.md](./storage-restore.md) |
| Safety / moderation P1 | [moderation-incidents.md](./moderation-incidents.md) |

---

## Alerts

Full alert catalog: [alerts.md](../operations/monitoring/alerts.md)

| Tier | Response |
|------|----------|
| Critical | Immediate — page on-call |
| Warning | < 15 min acknowledge |
| Info | Next business day review |

---

## Post-incident

- P1: postmortem within 5 business days
- Update runbook if steps were wrong or missing
- HQ Launch War Room ops registry if new risk identified

---

## Health commands

```bash
curl -s https://bamsignal.com/health
curl -s -o /dev/null -w "%{http_code}\n" https://bamsignal.com/ready
```
