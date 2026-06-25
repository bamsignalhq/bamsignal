# BamSignal Release Incident Record

> Copy to `docs/releases/incidents/INC-YYYY-MM-DD-NNN.md` for release-related incidents.  
> Link from the parent [release record](./release-template.md) **Incident Log** section.

---

## Incident Summary

| Field | Value |
|-------|-------|
| **Incident ID** | INC-YYYY-MM-DD-NNN |
| **Title** | |
| **Severity** | SEV-1 Critical / SEV-2 High / SEV-3 Medium / SEV-4 Low |
| **Status** | Detected / Investigating / Mitigating / Resolved / Post-mortem |
| **Related Release** | vX.Y.Z @ `<commit-sha>` |
| **Environment** | Production / Staging |
| **Owner** | |
| **Created** | YYYY-MM-DD HH:MM WAT |
| **Resolved** | |

---

## Timeline

| Time (WAT) | Event |
|------------|-------|
| | Detection |
| | Escalation |
| | Mitigation started |
| | Rollback initiated (if applicable) |
| | Service restored |
| | Post-mortem scheduled |

---

## Detection

**How detected:** Monitoring / User report / `/ready` alert / Coolify deploy failure / Manual QA

**First signal:**

---

## Impact

### User Impact

<!-- Members unable to login, payments failing, etc. -->

### Business Impact

<!-- Revenue, signup blockage, Play Store review risk -->

### Scope

- **Affected surfaces:** Homepage / Login / Payments / Android / Admin / Other
- **Estimated users affected:**
- **Duration:**

---

## Root Cause

<!-- Technical root cause — not symptoms -->

---

## Resolution

### Immediate Actions

1.

### Permanent Fix

<!-- Commit SHA, release version -->

### Rollback Used?

☐ Yes — see `docs/releases/rollback/`  
☐ No

---

## Preventive Actions

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| | | | ☐ Open ☐ Done |

---

## Lessons Learned

### What went well

-

### What went poorly

-

### Action items for release process

-

---

## References

- Release record: `docs/releases/history/`
- Rollback record: `docs/releases/rollback/`
- Runbook: [deployment-recovery.md](../../runbooks/deployment-recovery.md)
- Metrics snapshot: `docs/releases/metrics/`

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Incident Owner | | |
| Release Engineer | | |
| Post-mortem Reviewer | | |
