# Alert Definitions

Production alert thresholds and routing. Alerts are defined here; delivery mechanisms (Coolify notifications, Telegram, future PagerDuty) plug in without changing thresholds.

**Principle:** Every alert must be **actionable**, **owned**, and linked to a **runbook**.

---

## Alert severity mapping

| Alert severity | Incident level | Response |
|----------------|----------------|----------|
| Critical | P1 | Immediate page |
| High | P2 | Page within 15 min |
| Medium | P3 | Ticket, next business day |
| Low | P4 | Log / weekly review |

See [incident-escalation.md](./incident-escalation.md).

---

## Application & API

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| API down | `/health` != 200 | 2 consecutive failures | 2 min | Critical | API Down |
| Readiness failed | `/ready` != 200 | 2 consecutive failures | 2 min | Critical | API Down |
| Ready check storm | `ready_check_failed` log rate | > 5/min | 5 min | High | API Down |
| API latency high | p95 request latency | > 2000 ms | 10 min | High | API Down |
| API error rate | 5xx / total requests | > 1% | 5 min | High | API Down |
| Authentication failures | `pin_login_failed` rate | > 500/min | 5 min | Medium | Authentication Failure |
| Auth lockout spike | `pin_login_locked` rate | > 100/hour | 1 hour | High | Authentication Failure |
| Background task failed | `background_task_failed` | > 10/hour | 15 min | High | API Down |
| Retry exhausted | `retry_exhausted` | Any sustained | 10 min | High | Service-specific |

---

## Database

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Database unreachable | `/ready` database false | Immediate | 1 min | Critical | Database Down |
| Schema incomplete | `schema.ok === false` | Immediate | 1 min | Critical | Database Down |
| Connection pool high | Active connections / max | > 80% | 10 min | High | Database Down |
| Query latency | p95 query time | > 1000 ms | 15 min | High | Database Down |
| Throttle DB fallback | `throttle_db_unavailable` | > 50/hour | 15 min | Medium | Database Down |

---

## Payments

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Paystack not configured | `/ready` paystack false | Immediate | 1 min | Critical | Payment Failure |
| Payment webhook failures | `payment_webhook_failed` | > 5 in 15 min | 15 min | Critical | Payment Failure |
| Payment verify failures | Verify endpoint error rate | > 2% | 10 min | Critical | Payment Failure |
| Fulfillment lag | Time init → entitlement | > 5 min p95 | 15 min | High | Payment Failure |
| Paid-not-active backlog | Manual/admin count | > 0 sustained 1h | 1 hour | High | Payment Failure |

---

## Notifications

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Signup email down | `/ready` signupEmail false | Immediate | 1 min | Critical | Notification Failure |
| Email delivery failures | Resend error rate | > 5% | 15 min | High | Notification Failure |
| Push failures | FCM error rate | > 10% | 15 min | High | Notification Failure |
| WhatsApp failures | SendChamp error rate | > 10% | 15 min | High | Notification Failure |
| Notification queue backlog | Queue depth | > 1000 | 30 min | High | Notification Failure |

---

## Calendar & meetings

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Calendar OAuth invalid | Scheduling 503 sustained | > 10 failures/hour | 1 hour | High | Calendar Failure |
| Zoom link failures | Meeting creation errors | > 5/hour | 1 hour | Medium | Calendar Failure |
| Meet link failures | Meet creation errors | > 5/hour | 1 hour | Low | Calendar Failure |

---

## Storage

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Photo storage down | `/ready` photoStorage false | Immediate | 1 min | Critical | Storage Failure |
| Upload failure rate | Photo upload 5xx | > 5% | 10 min | High | Storage Failure |
| Storage quota | Bucket usage | > 80% | 1 hour | High | Storage Failure |
| Supabase storage API errors | 5xx from storage | > 1% | 10 min | High | Storage Failure |

---

## Deep links

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| assetlinks unreachable | HTTP != 200 | 2 failures | 5 min | High | Deep Link Failure |
| Play Console domain warning | Manual review | Unresolved | — | Medium | Deep Link Failure |
| Payment return browser-only | User reports + probe | Pattern detected | — | High | Deep Link Failure |

---

## Infrastructure

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Container restart loop | Restart count | > 3/hour | 1 hour | Critical | Docker Failure |
| CPU sustained high | Container CPU | > 85% | 15 min | High | API Down |
| Memory sustained high | Container memory | > 90% | 10 min | Critical | Docker Failure |
| Disk usage high | Host or container disk | > 85% | 1 hour | High | Docker Failure |
| OOM kill | Container OOM event | Any | Immediate | Critical | Docker Failure |

---

## Deployment

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Deploy failed | Coolify build fail | Immediate | — | High | Deployment Failure |
| Post-deploy ready fail | `/ready` after deploy | != 200 for 5 min | 5 min | Critical | Deployment Failure |
| Migration failure | Boot log migration error | Immediate | — | Critical | Deployment Failure |

---

## Android

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Crash-free rate drop | Play Console | < 99% | 24 hours | High | Android Release Failure |
| ANR rate spike | Play Console | > 0.5% | 24 hours | High | Android Release Failure |
| Stale assets detected | verify-android-assets fail | CI/pre-release | — | Critical | Android Release Failure |

---

## Security & certificates

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| SSL cert expiry | Days to expiry | < 30 days | Daily check | High | Infrastructure review |
| SSL cert expiry critical | Days to expiry | < 7 days | Daily check | Critical | Infrastructure review |
| Domain expiry | WHOIS | < 60 days | Weekly | Medium | Infrastructure review |
| Diagnostics brute force | `diagnostics_access_denied` spike | > 100/hour | 1 hour | Medium | Security review |

---

## Backups

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Backup failed | Last backup job | Failed | Immediate | Critical | [database-backup.md](../../runbooks/database-backup.md) |
| Backup stale | Age of last DB backup | > 48 hours | Daily | High | database-backup |
| Restore drill overdue | Last successful drill | > 90 days | Quarterly | Medium | DR review |

---

## Queues & workers

| Alert | Condition | Threshold | Duration | Severity | Runbook |
|-------|-----------|-----------|----------|----------|---------|
| Worker crash | Process exit non-zero | Any repeat | 5 min | Critical | Docker Failure |
| Queue backlog | Concierge / notification queue | > SLA threshold | 30 min | High | Operations triage |
| Cron missed | Expected cron 200 absent | 1 missed window | 2x interval | High | API Down |

---

## Alert routing (recommended)

| Severity | Primary | Secondary | Escalation |
|----------|---------|-----------|------------|
| Critical (P1) | Release Engineer / on-call | Founder | 30 min → Founder |
| High (P2) | Engineering lead | Release Engineer | 2 hours |
| Medium (P3) | Ticket queue | — | Next standup |
| Low (P4) | Weekly ops review | — | — |

**Channels today:** Coolify deploy notifications, optional Telegram (`TELEGRAM_BOT_TOKEN`), structured logs in container stdout.

**Future:** PagerDuty/Opsgenie integration keyed to this table — no threshold changes required.

---

## Alert hygiene

- **No alert without runbook** — every row links to [runbooks.md](./runbooks.md) or disaster recovery docs
- **Tune quarterly** — reduce false positives; document changes
- **Suppress during maintenance** — document window in release record
- **Test alerts** — staging probe failure drill semi-annually

---

## Structured log events (in-repo)

Monitor these events from `server/services/observability.js`:

| Event | Default level |
|-------|---------------|
| `ready_check_failed` | error (thresholded) |
| `payment_webhook_failed` | error |
| `pin_login_failed` | info (aggregate for alert) |
| `pin_login_locked` | error |
| `throttle_db_unavailable` | error |
| `background_task_failed` | error |
| `retry_exhausted` | error |
| `diagnostics_access_denied` | info |

---

## Related

- [slis.md](./slis.md)
- [slos.md](./slos.md)
- [incident-escalation.md](./incident-escalation.md)
- [runbooks.md](./runbooks.md)
