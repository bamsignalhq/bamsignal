# Error Budget Policy

Error budgets quantify **allowed unreliability** before release velocity must slow and incident response intensifies. Derived from SLOs in [slos.md](./slos.md) and measured via SLIs in [slis.md](./slis.md).

---

## Core formula

```text
Error Budget = 100% − SLO Target
Allowed Bad Events = Error Budget × Total Events (in window)
Remaining Budget = Allowed Bad Events − Actual Bad Events
```

---

## Availability targets

| SLO | Target | Monthly error budget (30d) | Quarterly budget (90d) |
|-----|--------|---------------------------|--------------------------|
| API availability (SLO-API-AVAIL) | 99.9% | 43.8 minutes downtime | 131.4 minutes |
| Public site (SLO-PUBLIC-AVAIL) | 99.9% | 43.8 minutes | 131.4 minutes |
| Member experience (SLO-MEMBER-AVAIL) | 99.5% | 3.6 hours | 10.8 hours |
| Admin (SLO-ADMIN-AVAIL) | 99.5% | 3.6 hours | 10.8 hours |
| Operations (SLO-OPS-AVAIL) | 99.5% | 3.6 hours | 10.8 hours |

**Downtime definition:** `/ready` probe failure or user-visible outage affecting SLO scope.

---

## Non-availability error budgets

| SLO | Target | Budget | Measurement |
|-----|--------|--------|-------------|
| API 5xx rate (SLO-API-ERR) | < 0.1% | 0.1% of requests may 5xx | SLI-ERR-API-5XX |
| Payment fulfillment (SLO-PAY-SUCCESS) | 99.5% | 0.5% failed fulfillments | SLI-PAY-FULFILL |
| Email delivery (SLO-NOTIF-EMAIL) | 98% | 2% failed deliveries | SLI-NOTIF-EMAIL |
| Push delivery (SLO-NOTIF-PUSH) | 95% | 5% failed deliveries | SLI-NOTIF-PUSH |
| Photo upload (SLO-STORAGE-UPLOAD) | 99.5% | 0.5% failed uploads | SLI-ERR-UPLOAD |
| Journey persistence (SLO-JOURNEY) | 99.99% | 0.01% failed writes | SLI-JOURNEY-PERSIST |

---

## Budget burn states

| State | Remaining budget | Action |
|-------|------------------|--------|
| **Green** | > 50% | Normal release velocity |
| **Yellow** | 25–50% | Increase monitoring; defer risky changes |
| **Orange** | 10–25% | Code freeze for non-fixes; daily SRE review |
| **Red** | < 10% or exhausted | Release freeze; reliability sprint; P1 review |

---

## Monthly budget process

1. **Calculate** — Compute remaining budget per Tier 1 SLO at month start
2. **Track** — Update weekly in Engineering dashboard (manual until automated)
3. **Report** — Include in monthly ops review and [release metrics](../../releases/metrics/)
4. **Reset** — Rolling 30-day window (not calendar month) recommended

---

## Quarterly budget process

| Activity | Owner | Output |
|----------|-------|--------|
| Quarterly SLO compliance report | SRE | Pass/fail per SLO |
| Error budget trend analysis | Engineering lead | Capacity / reliability investments |
| DR drill verification | DevOps | Backup restore evidence |
| Alert tuning review | SRE | Updated [alerts.md](./alerts.md) |

---

## Recovery expectations

When error budget enters **Orange** or **Red**:

| Expectation | Target |
|-------------|--------|
| P1 incident resolution | < 4 hours |
| P2 incident resolution | < 24 hours |
| Root cause documented | Within 5 business days |
| Preventive action ticket | Within 10 business days |
| SLO return to green | Within same measurement window if possible |

---

## Escalation policy (error budget)

| Trigger | Escalation |
|---------|------------|
| Tier 1 SLO budget < 25% | Notify Engineering lead |
| Tier 1 SLO budget exhausted | Notify Founder; release freeze |
| 2+ Tier 1 SLOs red same window | Reliability sprint mandated |
| Repeated budget exhaustion (2 consecutive months) | Architecture review; capacity plan update |

Full incident escalation: [incident-escalation.md](./incident-escalation.md).

---

## Planned maintenance exclusion

Planned maintenance **may** be excluded from error budget if:

1. Documented in release record **Maintenance Window**
2. External probe checks suppressed during window
3. Duration ≤ approved maintenance window
4. Post-maintenance verification passed within 30 minutes

Unplanned deploy failures during maintenance count against budget.

---

## Release integration

| Release phase | Error budget check |
|---------------|-------------------|
| Pre-deploy | Confirm not in Red state for Tier 1 |
| Post-deploy T+24h | Compare error rate delta vs baseline |
| 7-day review | Record budget consumption in release record |

Templates: [metrics-template.md](../../releases/templates/metrics-template.md), [release-template.md](../../releases/templates/release-template.md).

---

## Error budget and feature velocity

| Budget state | Feature releases | Hotfixes |
|--------------|------------------|----------|
| Green | Allowed | Allowed |
| Yellow | Allowed with extra QA | Allowed |
| Orange | P1 fixes only | Allowed |
| Red | Frozen | Allowed |

Hotfixes always allowed for active P1 — but consume budget and require postmortem.

---

## Manual tracking template

Until metrics automation exists, record weekly:

| Week | SLO | Budget remaining | Incidents | Notes |
|------|-----|------------------|-----------|-------|
| W26-2026 | SLO-API-AVAIL | 98% | 0 | |
| W26-2026 | SLO-PAY-SUCCESS | 99.2% | 1 webhook spike | |

Store snapshots in `docs/releases/metrics/` or admin review notes.

---

## Related

- [slos.md](./slos.md)
- [slis.md](./slis.md)
- [incident-escalation.md](./incident-escalation.md)
- [alerts.md](./alerts.md)
