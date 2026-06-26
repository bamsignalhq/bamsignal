# Alert Handling

## Recommended alert signals

| Signal | Threshold | Severity | First action |
|--------|-----------|----------|--------------|
| `/ready` != 200 | 2 consecutive failures | P0 | Check Coolify + Supabase + secrets |
| `/health` down | Any | P0 | Container crash — restart / rollback |
| `pin_login_failed` spike | >3× baseline 15 min | P1 | DB connectivity, abuse review |
| `payment_webhook_failed` | Any sustained | P1 | Paystack dashboard + webhook secret |
| Error rate 5xx | >1% 10 min | P1 | Logs + recent deploy |
| Disk / memory | Host alerts | P2 | Coolify host capacity |

Full catalog: `docs/operations/monitoring/alerts.md`

## Alert response workflow

1. **Acknowledge** within SLA (15 min for P1).
2. **Triage** using `RUNBOOK.md` quick table.
3. **Mitigate** — rollback, restart, or failover playbook.
4. **Communicate** — founder for P1/P2; status updates every 30 min for P1.
5. **Resolve** — verify `smoke:production` and member smoke paths.
6. **Document** — incident template + postmortem if required.

## Diagnostics commands

```bash
curl -s https://bamsignal.com/health | jq .
curl -s -H "x-diagnostics-secret: $SECRET" \
  "https://bamsignal.com/ready?details=1" | jq .
```

API diagnostics (secret required):

- `/api/diagnostics/paystack-connectivity`
- `/api/diagnostics/view-security`
- `/api/diagnostics/function-security`

## False positives

- `/ready` 503 immediately after deploy: check `start-period` in Dockerfile healthcheck.
- Memory throttle logs during DB blip: restore DB before disabling throttle.
