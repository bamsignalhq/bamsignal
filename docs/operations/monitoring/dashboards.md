# Monitoring Dashboards

Dashboard **definitions only** — no vendor implementation. Each dashboard lists purpose, audience, primary SLIs, and data sources available today vs future integration.

**Data sources today:** `/health`, `/ready`, structured logs (`server/services/observability.js`), admin command center engines, Coolify container metrics, Supabase dashboard, Play Console, manual release metrics.

---

## Executive

| Field | Value |
|-------|-------|
| **Audience** | Founder, leadership |
| **Refresh** | Daily / on-demand |
| **Purpose** | Business health at a glance — uptime, revenue signals, member growth |

| Panel | SLI | Source (today) | Source (future) |
|-------|-----|----------------|-----------------|
| Production uptime | Availability | External `/ready` probe | Uptime SaaS |
| Payment success rate | Payment SLI | Admin finance ops / manual | Metrics pipeline |
| Active members | Business KPI | Supabase / admin | Warehouse |
| Concierge pipeline | Ops KPI | Operations Center | Dashboard API |
| Open P1/P2 incidents | Incident count | [incidents](../../releases/incidents/) | Incident tool |
| Error budget remaining | Error budget | [error-budget.md](./error-budget.md) | SLO dashboard |

**Admin path:** Executive-facing aggregates via admin hub (read-only for founder role).

---

## Operations

| Field | Value |
|-------|-------|
| **Audience** | Operations team, concierge leads |
| **Refresh** | Real-time (target 1–5 min) |

| Panel | SLI | Source |
|-------|-----|--------|
| Concierge queue depth | Queue backlog | Operations Center |
| Unassigned applications | Assignment lag | Operations Center |
| Consultant workload | Capacity | Consultant portal / admin |
| Regional team balance | Ops efficiency | Regional teams engine |
| Notification failures | Delivery SLI | Logs / admin |
| Escalations (24h) | Ops volume | Internal messaging |

---

## Engineering

| Field | Value |
|-------|-------|
| **Audience** | Engineering, SRE, on-call |
| **Refresh** | Real-time |

| Panel | SLI | Source |
|-------|-----|--------|
| `/ready` status | Readiness | Probe + logs |
| API error rate (5xx) | Error rate SLI | Logs (future: metrics) |
| API latency p50/p95/p99 | Latency SLI | Future APM |
| Deploy status | Release health | Coolify |
| Structured alert events | Alert volume | `ready_check_failed`, `payment_webhook_failed`, etc. |
| Container restarts | Infrastructure | Coolify |
| Schema status | DB health | `/ready?details=1` |

**Admin path:** `/hard/system-health`, `/hard/monitoring`, `/hard/performance`

---

## Payments

| Panel | SLI | Alert link |
|-------|-----|------------|
| Initialize success rate | Paystack init | [alerts.md](./alerts.md) |
| Verify success rate | Paystack verify | |
| Webhook failure rate | `payment_webhook_failed` | |
| Fulfillment lag | Ledger processing time | |
| Failed entitlements | Paid-but-not-active count | [payment-recovery.md](../../runbooks/payment-recovery.md) |
| Revenue (24h) | Business | Finance ops |

---

## Notifications

| Panel | SLI |
|-------|-----|
| Email delivery rate | Resend success |
| Push delivery rate | FCM success |
| WhatsApp delivery rate | SendChamp success |
| Queue backlog | Pending notifications |
| Signup email health | `/ready` signupEmail |

---

## CRM

| Panel | SLI |
|-------|-----|
| Member sync errors | `/api/member/*` failures |
| Profile hydration failures | Client error logs |
| Signup completion rate | Funnel |
| Support ticket volume | Support center |

---

## Consultants

| Panel | SLI |
|-------|-----|
| Active consultants | Workforce |
| Assignments per consultant | Workload |
| Consultation completion rate | Scheduling SLI |
| Quality scores | Consultant quality engine |
| Portal availability | `/consultant` uptime |

---

## Infrastructure

| Panel | SLI |
|-------|-----|
| CPU utilization | Infra |
| Memory utilization | Infra |
| Disk usage | Host + Supabase |
| Network throughput | Egress |
| SSL cert expiry days | Security |
| Backup last success | DR |
| Docker health | `/ready` |

**Source:** Coolify, Supabase dashboard, host metrics (future: Prometheus/node_exporter).

---

## Android

| Panel | SLI |
|-------|-----|
| Crash-free sessions | Play Console |
| ANR rate | Play Console |
| Active installs | Play Console |
| Deep link verification | Play Console + assetlinks |
| Version adoption | versionCode distribution |

---

## API

| Panel | SLI |
|-------|-----|
| Request rate | Throughput |
| Latency by route | p95 per `/api/*` group |
| Error rate by route | 4xx / 5xx |
| Auth endpoint health | pin-login success rate |
| Rate limit hits | Throttle events |
| Diagnostics usage | Admin/diagnostics access |

---

## Database

| Panel | SLI |
|-------|-----|
| Connection pool usage | Supabase |
| Query latency p95 | Supabase / pg_stat |
| Active connections | Supabase |
| Disk usage | Supabase |
| Migration version | Latest `migrations/*.sql` |
| Missing tables | `/ready` schema check |

---

## Security

| Panel | SLI |
|-------|-----|
| Failed login rate | `pin_login_failed` |
| Lockout rate | `pin_login_locked` |
| Admin PIN throttle | Admin security |
| Diagnostics denied | `diagnostics_access_denied` |
| Certificate expiry | SSL monitor |
| Permission audit status | `/hard/audit/permissions` |

---

## Release Health

| Panel | SLI | Source |
|-------|-----|--------|
| Current production version | Release identity | [release history](../../releases/history/index.md) |
| Deploy age | Time since last deploy | Coolify |
| Post-deploy error delta | Error rate vs baseline | Metrics T+0 vs T+24h |
| Rollback status | Release status | Release record |
| Deep link post-release | Verification | Release checklist |
| 7-day review due | Governance | Release lifecycle |

Integrates with [Release Management System](../../releases/README.md).

---

## Dashboard access matrix

| Dashboard | Founder | Ops | Engineering | Security |
|-----------|---------|-----|-------------|----------|
| Executive | ✓ | read | — | — |
| Operations | read | ✓ | read | — |
| Engineering | — | read | ✓ | read |
| Payments | read | read | ✓ | — |
| Security | — | — | ✓ | ✓ |
| Release Health | ✓ | read | ✓ | — |

---

## Future implementation notes

When integrating a metrics platform:

1. Map each panel SLI to a named metric (see [slis.md](./slis.md))
2. Use consistent labels: `env`, `service`, `route`, `release_version`
3. Do not duplicate admin UI — export aggregates for on-call
4. Executive dashboard stays non-technical; no raw log streams

See [observability-architecture.md](./observability-architecture.md).

---

## Related

- [slis.md](./slis.md)
- [alerts.md](./alerts.md)
- [../releases/templates/metrics-template.md](../../releases/templates/metrics-template.md)
