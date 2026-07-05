# Moderation incidents runbook

**Scope:** Reports, blocks, photo verification queue, trust & safety escalations.

---

## Channels

- In-app: Report / block flows
- Admin: Launch Command / moderation queue (photo review)
- HQ: Trust OS dashboard in Launch War Room

---

## Severity

| Level | Example | Response |
|-------|---------|----------|
| P1 | CSAM, credible threat, active harassment campaign | Immediate founder + preserve evidence |
| P2 | Repeated harassment, scam patterns | Queue review < 4h |
| P3 | Single report, unclear | Standard queue SLA 48h |

---

## Investigation

1. Reporter and reported profile IDs.
2. Chat logs if consent/policy allows.
3. `member_reports` / moderation tables.
4. Photo verification status.

---

## Actions

| Action | When |
|--------|------|
| Block user | Reporter request or policy violation |
| Hide profile from discover | Pending review |
| Suspend account | Confirmed violation |
| Escalate legal | P1 categories |

**Do not** delete audit rows during active investigation.

---

## Photo verification backlog

1. Launch Command → verification queue count.
2. Assign reviewer; approve/reject with reason.
3. Alert if queue > 48h — see monitoring [alerts.md](../operations/monitoring/alerts.md).

---

## Verification

- [ ] Test report flow creates queue entry
- [ ] Block prevents messaging
- [ ] Founder War Room moderation panel loads

**Escalation:** [support-escalation.md](./support-escalation.md) Tier 3 for P1.
