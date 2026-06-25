# BamSignal Release Management System

Permanent release documentation standard for every production deployment, staging deployment, hotfix, rollback, and release candidate.

**Platform:** [Coolify](https://control.bamsignal.com) — Docker at [https://bamsignal.com](https://bamsignal.com)  
**Repository:** [github.com/bamsignalhq/bamsignal](https://github.com/bamsignalhq/bamsignal)  
**Branch policy:** `main` is the release branch

---

## Purpose

Every release must be **reproducible**, **auditable**, **reviewable**, and **recoverable**. Months later, any engineer must be able to answer:

- What exactly shipped?
- Which database schema existed?
- Which Docker image was deployed?
- What was production health?
- How do we rollback?
- What problems occurred?
- Who approved production?

Session-oriented release bundles (for example [Production Hardening Release Session Bundle](../evaluation/bamsignal-production-hardening-release-session-bundle.txt)) remain valid engineering artifacts. This system is the **permanent standard** that replaces ad-hoc session summaries for operational releases.

---

## Directory structure

| Path | Purpose |
|------|---------|
| [templates/](./templates/) | Master templates for releases, rollbacks, incidents, and metrics |
| [history/](./history/) | Release history index and per-release records |
| [archive/](./archive/) | Completed releases moved out of active history |
| [hotfixes/](./hotfixes/) | Emergency production patches |
| [rollback/](./rollback/) | Rollback execution records |
| [checklists/](./checklists/) | Pre-flight and verification checklists |
| [incidents/](./incidents/) | Release-related incident records |
| [metrics/](./metrics/) | Post-release operational metrics snapshots |
| [rc/](./rc/) | Release candidate builds and sign-off |

---

## Quick start — new release

1. Copy [templates/release-template.md](./templates/release-template.md) to `docs/releases/history/YYYY-MM-DD-vX.Y.Z.md` (or `docs/releases/rc/rc-N-description.md` for candidates).
2. Fill **Release Information** and **Rollback Plan** before any production deploy.
3. Complete [checklists/production-release-checklist.md](./checklists/production-release-checklist.md).
4. Run [checklists/deep-link-verification.md](./checklists/deep-link-verification.md) when Android or payment return paths change.
5. After deploy, complete **Production Verification** and **Operational Metrics** sections.
6. Update [history/index.md](./history/index.md) with version, date, commit, and status.
7. On rollback, copy [templates/rollback-template.md](./templates/rollback-template.md) into `docs/releases/rollback/`.
8. On incident, copy [templates/incident-template.md](./templates/incident-template.md) into `docs/releases/incidents/`.

---

## Release lifecycle

```text
Draft → Ready → Approved → Released → Archived
                    ↓           ↓
                 Hotfix    Rolled Back
```

| Status | Meaning |
|--------|---------|
| **Draft** | Release notes in progress; not deployable |
| **Ready** | Checklists complete; awaiting approval |
| **Approved** | Sign-off recorded; deploy authorized |
| **Released** | Production verified; monitoring active |
| **Hotfix** | Emergency patch on top of a released version |
| **Rolled Back** | Previous stable version restored |
| **Archived** | Closed; moved to [archive/](./archive/) |

---

## Related documentation

| Document | Use |
|----------|-----|
| [automation-architecture.md](./automation-architecture.md) | Future CI/CD release automation (architecture only) |
| [../runbooks/deployment-recovery.md](../runbooks/deployment-recovery.md) | Coolify rollback and recovery |
| [../runbooks/README.md](../runbooks/README.md) | Disaster recovery runbooks |
| [../operations/monitoring/README.md](../operations/monitoring/README.md) | Production monitoring, SLOs, alerts |
| [.cursor/rules/deployment.mdc](../../.cursor/rules/deployment.mdc) | Deploy commands and env policy |

---

## Naming conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Production release | `history/YYYY-MM-DD-vX.Y.Z.md` | `history/2026-06-25-v1.0.14.md` |
| Release candidate | `rc/rc-N-short-name.md` | `rc/rc-3-payment-deep-links.md` |
| Hotfix | `hotfixes/YYYY-MM-DD-hotfix-description.md` | `hotfixes/2026-06-26-hotfix-ready-503.md` |
| Rollback record | `rollback/YYYY-MM-DD-rollback-from-vX-to-vY.md` | `rollback/2026-06-26-rollback-v1.0.15-to-v1.0.14.md` |
| Incident | `incidents/INC-YYYY-MM-DD-NNN.md` | `incidents/INC-2026-06-25-001.md` |
| Metrics snapshot | `metrics/YYYY-MM-DD-vX.Y.Z-metrics.md` | `metrics/2026-06-25-v1.0.14-metrics.md` |

---

## Required commands before release

```bash
npm run build
npm run test:server-import
npm run test:source-integrity
```

When Android assets change, also run:

```bash
npx cap sync android
npm run android:verify-assets
```

When SEO content changes, also run:

```bash
npm run seo:validate
```
