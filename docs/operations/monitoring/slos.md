# Service Level Objectives (SLOs)

SLOs define **target reliability** for BamSignal production services. Each SLO maps to SLIs in [slis.md](./slis.md) and consumes error budget per [error-budget.md](./error-budget.md).

**Measurement window:** 30-day rolling (default) unless noted.

---

## SLO summary

| SLO ID | Service | Objective | SLI | Target |
|--------|---------|-----------|-----|--------|
| SLO-API-AVAIL | Backend API | Availability | SLI-AVAIL-API | 99.9% |
| SLO-API-LAT | Backend API | Latency | SLI-LAT-API-P95 | < 800 ms |
| SLO-API-ERR | Backend API | Error rate | SLI-ERR-API-5XX | < 0.1% |
| SLO-PUBLIC-AVAIL | Public website | Availability | SLI-AVAIL-PUBLIC | 99.9% |
| SLO-MEMBER-AVAIL | Member experience | Availability | SLI-AVAIL-MEMBER | 99.5% |
| SLO-AUTH | Authentication | Success rate | 1 − SLI-ERR-AUTH (valid attempts) | 99.5% |
| SLO-PAY-SUCCESS | Payments | End-to-end success | SLI-PAY-FULFILL | 99.5% |
| SLO-PAY-LAT | Payments | Verify latency | SLI-LAT-PAY-VERIFY | p95 < 30 s |
| SLO-NOTIF-EMAIL | Email | Delivery | SLI-NOTIF-EMAIL | 98% |
| SLO-NOTIF-PUSH | Push | Delivery | SLI-NOTIF-PUSH | 95% |
| SLO-NOTIF-WA | WhatsApp | Delivery | SLI-NOTIF-WA | 95% |
| SLO-SCHEDULE | Consultation scheduling | Success | SLI-LAT-SCHEDULE completion | 99% within 60 s |
| SLO-CONCIERGE-PROC | Concierge applications | Processing | SLI-CONCIERGE-QUEUE | p95 < 24 h assignment |
| SLO-JOURNEY | Journey persistence | Durability | SLI-JOURNEY-PERSIST | 99.99% |
| SLO-ADMIN-AVAIL | Admin command center | Availability | SLI-AVAIL-ADMIN | 99.5% |
| SLO-OPS-AVAIL | Operations Center | Availability | SLI-AVAIL-OPS | 99.5% |
| SLO-STORAGE-UPLOAD | Photo storage | Upload success | 1 − SLI-ERR-UPLOAD | 99.5% |
| SLO-DB-LAT | Database | Query latency | SLI-LAT-DB-P95 | < 500 ms |

---

## SLO details

### SLO-API-AVAIL — API availability

| Field | Value |
|-------|-------|
| **Target** | 99.9% monthly (≤ 43.8 min downtime) |
| **SLI** | SLI-AVAIL-API (`/ready` probe success) |
| **Scope** | Production `https://bamsignal.com/ready` |
| **Exclusions** | Planned maintenance (documented in release record) |
| **Owner** | SRE / Release Engineer |

---

### SLO-API-LAT — API latency

| Field | Value |
|-------|-------|
| **Target** | p95 < 800 ms |
| **SLI** | SLI-LAT-API-P95 |
| **Scope** | All `/api/*` routes |
| **Owner** | Engineering |

---

### SLO-API-ERR — API error rate

| Field | Value |
|-------|-------|
| **Target** | < 0.1% 5xx |
| **SLI** | SLI-ERR-API-5XX |
| **Owner** | Engineering |

---

### SLO-PUBLIC-AVAIL — Public website

| Field | Value |
|-------|-------|
| **Target** | 99.9% |
| **SLI** | SLI-AVAIL-PUBLIC |
| **Scope** | `/`, SEO pages, legal — no member shell |
| **Owner** | Engineering |

---

### SLO-MEMBER-AVAIL — Member experience

| Field | Value |
|-------|-------|
| **Target** | 99.5% |
| **SLI** | SLI-AVAIL-MEMBER |
| **Scope** | `/home`, `/discover`, `/chats`, `/signals`, `/profile` |
| **Owner** | Engineering |

---

### SLO-AUTH — Authentication

| Field | Value |
|-------|-------|
| **Target** | 99.5% success for valid credentials |
| **SLI** | Auth success rate (exclude invalid PIN from SLO numerator) |
| **Owner** | Engineering |
| **Note** | Credential stuffing spikes tracked separately via security alerts |

---

### SLO-PAY-SUCCESS — Payment success

| Field | Value |
|-------|-------|
| **Target** | 99.5% fulfillment after successful Paystack charge |
| **SLI** | SLI-PAY-FULFILL |
| **Owner** | Engineering / Finance Ops |
| **Runbook** | [payment-recovery.md](../../runbooks/payment-recovery.md) |

---

### SLO-PAY-LAT — Payment latency

| Field | Value |
|-------|-------|
| **Target** | p95 verify + fulfill < 30 seconds |
| **SLI** | SLI-LAT-PAY-VERIFY |
| **Owner** | Engineering |

---

### SLO-NOTIF-EMAIL — Email delivery

| Field | Value |
|-------|-------|
| **Target** | 98% delivery |
| **SLI** | SLI-NOTIF-EMAIL |
| **Owner** | Engineering |
| **Critical path** | Signup email gates `/ready` |

---

### SLO-NOTIF-PUSH — Push delivery

| Field | Value |
|-------|-------|
| **Target** | 95% delivery |
| **SLI** | SLI-NOTIF-PUSH |
| **Owner** | Engineering |
| **Note** | Degraded acceptable when Firebase optional |

---

### SLO-NOTIF-WA — WhatsApp delivery

| Field | Value |
|-------|-------|
| **Target** | 95% delivery |
| **SLI** | SLI-NOTIF-WA |
| **Owner** | Engineering / Operations |

---

### SLO-SCHEDULE — Consultation scheduling

| Field | Value |
|-------|-------|
| **Target** | 99% scheduling requests complete within 60 s |
| **SLI** | SLI-LAT-SCHEDULE |
| **Owner** | Operations / Engineering |
| **Dependencies** | Google Calendar, Zoom |

---

### SLO-CONCIERGE-PROC — Concierge application processing

| Field | Value |
|-------|-------|
| **Target** | p95 assignment within 24 hours |
| **SLI** | SLI-CONCIERGE-QUEUE |
| **Owner** | Operations |
| **Dashboard** | Operations Center |

---

### SLO-JOURNEY — Journey persistence

| Field | Value |
|-------|-------|
| **Target** | 99.99% write durability |
| **SLI** | SLI-JOURNEY-PERSIST |
| **Owner** | Engineering |
| **Verification** | `npm run audit:journeys` |

---

### SLO-ADMIN-AVAIL — Admin availability

| Field | Value |
|-------|-------|
| **Target** | 99.5% |
| **SLI** | SLI-AVAIL-ADMIN |
| **Scope** | `/hard/*` command center |
| **Owner** | Engineering |

---

### SLO-OPS-AVAIL — Operations availability

| Field | Value |
|-------|-------|
| **Target** | 99.5% |
| **SLI** | SLI-AVAIL-OPS |
| **Owner** | Operations |

---

### SLO-STORAGE-UPLOAD — Photo upload

| Field | Value |
|-------|-------|
| **Target** | 99.5% success |
| **SLI** | 1 − SLI-ERR-UPLOAD |
| **Owner** | Engineering |
| **Gates** | `/ready` photoStorage |

---

### SLO-DB-LAT — Database latency

| Field | Value |
|-------|-------|
| **Target** | p95 < 500 ms |
| **SLI** | SLI-LAT-DB-P95 |
| **Owner** | Engineering / DevOps |

---

## SLO tiering

| Tier | SLOs | Business impact |
|------|------|-----------------|
| **Tier 1** | API avail, Pay success, Auth, Public avail | Revenue + trust |
| **Tier 2** | Member avail, Notifications, Storage, Concierge | Core product |
| **Tier 3** | Admin, Ops, Scheduling latency | Internal efficiency |

Tier 1 SLO breaches trigger error budget policy immediately.

---

## SLA vs SLO

| Term | Definition |
|------|------------|
| **SLI** | Measured indicator |
| **SLO** | Internal target (this document) |
| **SLA** | External commitment to users/partners (if published) |

BamSignal SLAs default to SLO targets unless legally overridden. Executive SLA summary: 99.9% platform availability monthly.

---

## SLO review

| Activity | Frequency | Owner |
|----------|-----------|-------|
| SLO compliance review | Monthly | SRE |
| Target adjustment proposal | Quarterly | Engineering lead |
| Post-P1 SLO retrospective | Per incident | Incident owner |
| New service SLO definition | At launch | Service owner |

---

## Related

- [slis.md](./slis.md)
- [error-budget.md](./error-budget.md)
- [alerts.md](./alerts.md)
- [../releases/templates/metrics-template.md](../../releases/templates/metrics-template.md)
