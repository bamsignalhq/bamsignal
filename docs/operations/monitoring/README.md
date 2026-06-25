# BamSignal Production Monitoring & Observability System

Permanent operational standard for production health, alerting, SLOs, incident response, and observability architecture.

**Platform:** [Coolify](https://control.bamsignal.com) — Docker at [https://bamsignal.com](https://bamsignal.com)  
**Scope:** Documentation and operational standards only — **no third-party monitoring vendor integration**

This system defines what to measure, when to alert, who responds, and how to recover. Future integrations (Datadog, Grafana, Prometheus, Sentry, etc.) plug into this model — they do not replace it.

---

## Purpose

BamSignal operates multiple production surfaces — member web/PWA, Android, backend API, Supabase, payments, notifications, Signal Concierge, Operations Center, Executive Dashboard, and admin command center. Without a unified monitoring strategy:

- Problems go unnoticed until user reports
- Performance degrades silently
- Payment and notification failures accumulate
- Storage and database capacity exhaust without warning
- Trust erodes before engineering detects root cause

Monitoring is a **first-class institutional capability**, not an afterthought.

---

## Document map

| Document | Purpose |
|----------|---------|
| [service-dependencies.md](./service-dependencies.md) | Service inventory, owners, dependencies, failure modes |
| [health-checks.md](./health-checks.md) | Endpoints, probes, and verification expectations |
| [dashboards.md](./dashboards.md) | Dashboard definitions (no implementation) |
| [alerts.md](./alerts.md) | Alert thresholds and routing |
| [slis.md](./slis.md) | Service Level Indicators |
| [slos.md](./slos.md) | Service Level Objectives |
| [error-budget.md](./error-budget.md) | Error budgets and burn policies |
| [capacity-planning.md](./capacity-planning.md) | Growth planning by user scale |
| [incident-escalation.md](./incident-escalation.md) | P1–P4 severity and response |
| [runbooks.md](./runbooks.md) | Operational runbooks by failure scenario |
| [observability-architecture.md](./observability-architecture.md) | Future metrics, logs, tracing (architecture only) |

---

## Monitoring layers

```text
┌─────────────────────────────────────────────────────────────┐
│  Layer 4 — Business & Release                               │
│  Payments, signups, concierge SLA, release health             │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Application                                      │
│  /health, /ready, structured logs, admin Monitoring Center   │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Dependencies                                     │
│  Supabase, Paystack, Resend, SendChamp, Firebase, Calendar   │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Infrastructure                                   │
│  Coolify, Docker, CPU, memory, disk, SSL, DNS, backups       │
└─────────────────────────────────────────────────────────────┘
```

---

## Existing instrumentation (in-repo)

| Capability | Location |
|------------|----------|
| Liveness | `GET /health` — `server/services/readiness.js` |
| Readiness | `GET /ready` — DB, Paystack, signup email, photo storage |
| Structured events | `server/services/observability.js` |
| Request context | `requestContextMiddleware` in `server/app.js` |
| Admin surfaces | `/hard/system-health`, `/hard/monitoring`, `/hard/performance` |
| Certification tests | `npm run test:system-health`, `npm run test:monitoring` |
| Legacy reference | [MONITORING.md](../../MONITORING.md) (root — superseded by this framework for ops standards) |

Detailed `/ready` requires `x-diagnostics-secret` or admin session with `?details=1`.

---

## Quick triage

| Symptom | Start here |
|---------|------------|
| Site down / 503 | [runbooks.md](./runbooks.md) → API Down |
| `/ready` failing | [health-checks.md](./health-checks.md) + [service-dependencies.md](./service-dependencies.md) |
| Paid but no premium | [../runbooks/payment-recovery.md](../runbooks/payment-recovery.md) |
| Notifications silent | [runbooks.md](./runbooks.md) → Notification Failure |
| Bad deploy | [../releases/checklists/production-release-checklist.md](../releases/checklists/production-release-checklist.md) |
| Post-release metrics | [../releases/templates/metrics-template.md](../releases/templates/metrics-template.md) |

---

## On-call expectations

1. **Detect** — alert fires or `/ready` monitor fails
2. **Triage** — classify P1–P4 per [incident-escalation.md](./incident-escalation.md)
3. **Mitigate** — follow scenario runbook in [runbooks.md](./runbooks.md)
4. **Communicate** — status updates per escalation doc
5. **Resolve** — verify SLIs return to green
6. **Learn** — postmortem for P1/P2; update [../releases/incidents/](../releases/incidents/) if release-related

---

## Release integration

| Release artifact | Monitoring link |
|------------------|-----------------|
| [Production release checklist](../releases/checklists/production-release-checklist.md) | Monitoring section pre-deploy |
| [Metrics template](../releases/templates/metrics-template.md) | T+0 / T+24h / T+48h / T+7d captures |
| [Incident template](../releases/templates/incident-template.md) | P1/P2 production incidents |
| [Release history](../releases/history/index.md) | Release Health dashboard input |

---

## Verification commands

```bash
npm run build
npm run test:server-import
npm run test:source-integrity
npm run test:system-health    # monitoring certification
npm run test:monitoring       # monitoring center logic
```

External probe (manual):

```bash
curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/health   # expect 200
curl -s -o /dev/null -w "%{http_code}" https://bamsignal.com/ready    # expect 200 when deps configured
```

---

## Governance

| Role | Responsibility |
|------|----------------|
| **SRE / Release Engineer** | SLO definitions, alert tuning, runbook maintenance |
| **Engineering Lead** | Error budget policy, capacity reviews |
| **Operations** | Concierge queue, consultant workload dashboards |
| **Founder** | P1 escalation, executive dashboard review |
| **Security** | Auth failure alerts, certificate expiry |

Review this framework **quarterly** or after any P1 incident.

---

## Related documentation

- [Environment Configuration & Secrets](../environment/README.md)
- [Disaster recovery runbooks](../runbooks/README.md)
- [Release Management System](../releases/README.md)
- [Deployment recovery](../runbooks/deployment-recovery.md)
- [SYSTEM_ARCHITECTURE.md](../../SYSTEM_ARCHITECTURE.md)
