# Incident Escalation

Production incident severity levels, response expectations, communication standards, and postmortem requirements.

Integrates with [Release Incident Template](../../releases/templates/incident-template.md) and [alerts.md](./alerts.md).

---

## Severity levels

| Level | Name | Definition | Example |
|-------|------|------------|---------|
| **P1** | Critical | Complete outage or data loss risk; revenue blocked | `/ready` down > 5 min, payments broken platform-wide |
| **P2** | High | Major degradation; significant user impact | Concierge queue stalled 24h+, signup email down |
| **P3** | Medium | Partial degradation; workaround exists | Admin tab broken, Meet links fail (Zoom OK) |
| **P4** | Low | Minor issue; minimal user impact | SEO typo, non-critical log noise |

---

## P1 — Critical

| Field | Expectation |
|-------|-------------|
| **Who responds** | Release Engineer / on-call → Engineering lead → Founder |
| **Acknowledge** | < 15 minutes |
| **Mitigate** | < 1 hour (rollback or failover) |
| **Resolve** | < 4 hours |
| **Communicate** | Founder within 30 min; status updates every 30 min |
| **Postmortem** | Required within 5 business days |
| **Incident record** | [incident-template.md](../../releases/templates/incident-template.md) mandatory |

**Actions:** Page on-call, open incident channel, assign Incident Commander, execute [runbooks.md](./runbooks.md).

---

## P2 — High

| Field | Expectation |
|-------|-------------|
| **Who responds** | Release Engineer → Engineering lead |
| **Acknowledge** | < 30 minutes |
| **Mitigate** | < 4 hours |
| **Resolve** | < 24 hours |
| **Communicate** | Engineering lead + Ops; updates every 2 hours |
| **Postmortem** | Required within 10 business days |
| **Incident record** | Required |

---

## P3 — Medium

| Field | Expectation |
|-------|-------------|
| **Who responds** | Assigned engineer |
| **Acknowledge** | < 4 hours (business hours) |
| **Mitigate** | < 2 business days |
| **Resolve** | < 5 business days |
| **Communicate** | Ticket + standup mention |
| **Postmortem** | Optional; required if recurrence |
| **Incident record** | Recommended |

---

## P4 — Low

| Field | Expectation |
|-------|-------------|
| **Who responds** | Backlog owner |
| **Acknowledge** | Next business day |
| **Resolve** | Next sprint |
| **Communicate** | Ticket only |
| **Postmortem** | Not required |
| **Incident record** | Optional |

---

## Response roles

| Role | Responsibility |
|------|----------------|
| **Incident Commander (IC)** | Coordinates response, communications, timeline |
| **Technical Lead** | Diagnosis, mitigation, runbook execution |
| **Communications** | Founder/support updates (IC or delegate) |
| **Scribe** | Timeline documentation for postmortem |

For P1, IC is Release Engineer until Engineering lead assumes command.

---

## Escalation path

```text
Alert / Report
     │
     ▼
On-call / Release Engineer ──ack──► 15 min
     │
     ├── P1 unresolved 30 min ──► Engineering Lead
     │
     ├── P1 unresolved 2 hr ──► Founder
     │
     └── P2 unresolved 4 hr ──► Engineering Lead
```

---

## Communication templates

### Internal — incident opened (P1/P2)

```text
[P1/P2] BamSignal incident opened
Impact: <one line>
Started: <time WAT>
IC: <name>
Runbook: <link>
Next update: <time>
```

### Internal — resolved

```text
[P1/P2] RESOLVED
Duration: <start–end WAT>
Root cause: <brief or "under investigation">
Follow-up: Postmortem <date>
```

### External (Founder-approved, user-visible)

Use only for extended P1 affecting members — brief, factual, no speculation.

---

## Resolution targets summary

| Level | Acknowledge | Mitigate | Resolve | Postmortem |
|-------|-------------|----------|---------|------------|
| P1 | 15 min | 1 hr | 4 hr | 5 business days |
| P2 | 30 min | 4 hr | 24 hr | 10 business days |
| P3 | 4 hr | 2 days | 5 days | If recurring |
| P4 | 1 day | — | Next sprint | No |

---

## Postmortem requirements

### Required sections

1. Incident ID and severity
2. Timeline (WAT)
3. Impact (users, revenue, duration)
4. Root cause (technical, not blame)
5. Resolution steps
6. What went well / poorly
7. Preventive actions with owners and dates

### Blameless culture

Postmortems focus on systems and process — not individual fault.

### Storage

- P1/P2: `docs/releases/incidents/INC-YYYY-MM-DD-NNN.md`
- Link from release record if deploy-related
- Update [runbooks.md](./runbooks.md) if gap found

---

## Error budget escalation

Tier 1 SLO budget exhaustion escalates to **P2 minimum** for tracking even if service partially available. See [error-budget.md](./error-budget.md).

---

## Release-related incidents

| Scenario | Severity default |
|----------|------------------|
| Bad deploy, `/ready` fail | P1 |
| Payment regression post-release | P1 |
| Android crash spike post-AAB | P2 |
| Deep link regression | P2 |
| SEO-only regression | P4 |

Cross-link: [Release Management System](../../releases/README.md)

---

## On-call checklist (P1/P2)

- [ ] Classify severity
- [ ] Assign IC and Technical Lead
- [ ] Open incident record
- [ ] Execute runbook
- [ ] Notify per escalation path
- [ ] Capture timeline during incident
- [ ] Verify SLIs returned to green
- [ ] Schedule postmortem
- [ ] Update alerts/runbooks if needed

---

## Related

- [runbooks.md](./runbooks.md)
- [alerts.md](./alerts.md)
- [error-budget.md](./error-budget.md)
- [../runbooks/README.md](../../runbooks/README.md)
