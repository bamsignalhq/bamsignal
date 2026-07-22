# ADR-0005: Trust Signal Governance & Operations

**Status:** Accepted  
**Date:** 2026  
**Version Introduced:** Platform v2.2

---

## Decision

Introduce an **operational governance layer** for Trust Signals that is separate from the Trust Engine. Signals may enter the platform via ingestion, but administrators must be able to inspect, approve, reject, revoke, quarantine, and audit them at scale before ecosystem contributors send production traffic.

---

## Context

Platform v2.1 shipped server-side signal ingestion: receive → validate → consent → persist. Signals can enter the system, but ingestion alone is insufficient for production operations across BamSignal, BayRight, Yike, and external contributors.

Foundation v1.2 and Platform v2.0 contracts establish that:

- Signals are **evidence only** — not trust scores
- Human review remains **authoritative**
- Nothing is silently dropped — all actions are auditable
- Production records are **never hard-deleted**

---

## Problem

Without operational governance:

- Quarantined or suspicious signals have no review workflow
- Administrators cannot revoke or restore signals after acceptance
- Contributor anomalies (duplicate bursts, replay) go undetected
- Pipeline health is invisible at scale
- Audit trails are incomplete for compliance and dispute resolution

Automating trust decisions would violate constitutional boundaries. Doing nothing operational would make ingestion unsafe in production.

---

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Trust Engine handles governance | Conflates evidence operations with trust derivation — violates separation of concerns |
| Auto-approve all validated signals | Removes human authority for sensitive signal types |
| Hard-delete rejected signals | Violates audit and retention requirements |
| Product-specific admin tools | Duplicates governance; breaks cross-ecosystem Passport model |
| Real-time scoring on ingestion | Prohibited — no trust scoring at ingestion time |

---

## Decision Made

Implement Platform v2.2 Signal Governance with:

1. **Expanded lifecycle** — `received → validated → accepted → quarantined → rejected → revoked → expired → archived`
2. **Governance actions** — approve, reject, revoke, restore, expire, quarantine, annotate — each with audit record, governance event, reason code, actor, timestamp
3. **Admin review queue** — pending review, awaiting evidence, awaiting contributor, escalated, resolved, cancelled
4. **Append-only signal history** — creation, validation, governance, consent, contributor, lifecycle, retention
5. **Contributor health** — operational metrics only (`influencesTrust: false`)
6. **Replay monitoring** — repeated submissions, duplicate bursts, clock drift — alert contracts only
7. **Retention metadata** — active, archived, expired, revoked — no automatic hard delete
8. **Internal admin API** — protected by existing `requireAdmin`
9. **Observability expansion** — pipeline latency, validation failures, consent failures, governance counts
10. **Dashboard and alerting contracts** — backend interfaces for future UI and notification systems

Code: `server/services/passportSignals/governance/`, `api/passport/admin/signals.js`, `src/passport/signals/governance.ts`

Migration: `0057_passport_signal_governance.sql`

---

## Architectural Consequences

**Positive:**

- Signals are operable in production before Trust Engine ships
- Manual review remains the authority for sensitive evidence
- Full audit trail supports disputes and compliance
- Contributor health enables operational response without trust influence
- Clear separation preserves Foundation constitutional boundaries

**Negative:**

- Additional tables and admin surface area to maintain
- Review queue requires human staffing at scale
- Metrics are in-process until distributed observability ships

---

## Operational Philosophy

1. **Governance is operations, not trust** — no scoring, no AI decisions, no reputation calculations
2. **Nothing silent** — every governance action generates audit + event + history
3. **Append-only** — history is never overwritten; signals are never hard-deleted
4. **Human review authoritative** — automation may quarantine; humans approve or reject
5. **Contributor health is operational** — acceptance rates inform ops, not trust derivation

---

## Future Extensibility

| Future capability | Relationship to this ADR |
|-------------------|-------------------------|
| Trust Engine (ADR-0200+) | Consumes accepted signals only; does not replace governance |
| Governance dashboard UI | Consumes `buildGovernanceDashboardSnapshot()` contract |
| External alerting (PagerDuty, Slack) | Implements `PassportSignalAlertPublisher` |
| Distributed ingestion queues | Extends replay monitoring; governance actions unchanged |
| Automated quarantine rules | May enqueue review; cannot auto-approve without human policy |

---

## Related Documents

- [SIGNAL_GOVERNANCE.md](../SIGNAL_GOVERNANCE.md)
- [SIGNAL_IMPLEMENTATION.md](../SIGNAL_IMPLEMENTATION.md)
- [TRUST_SIGNAL_STANDARD.md](../TRUST_SIGNAL_STANDARD.md)
- [DIGITAL_TRUST_CONSTITUTION.md](../DIGITAL_TRUST_CONSTITUTION.md)

---

## Version History

| Version | Change |
|---------|--------|
| Platform v2.2 | Initial governance layer — lifecycle, review queue, admin API, observability |
