# Release History Index

Canonical index of BamSignal production releases. Update this file when a release reaches **Released**, **Hotfix**, **Rolled Back**, or **Archived** status.

**How to add a release:**

1. Create `docs/releases/history/YYYY-MM-DD-vX.Y.Z.md` from [release-template.md](../templates/release-template.md).
2. Add a row below (newest first).
3. Link the release record in the **Notes** column.

---

## Releases

| Version | Date | Commit | Status | Notes |
|---------|------|--------|--------|-------|
| — | — | — | — | *No formal release records yet. Use [release-template.md](../templates/release-template.md) for the next deploy.* |

---

## Release candidates

| RC | Date | Commit | Status | Notes |
|----|------|--------|--------|-------|
| — | — | — | — | Store RC docs in [../rc/](../rc/) |

---

## Hotfixes

| Version | Date | Commit | Status | Notes |
|---------|------|--------|--------|-------|
| — | — | — | — | Store hotfix docs in [../hotfixes/](../hotfixes/) |

---

## Rollbacks

| Date | From | To | Commit (restored) | Notes |
|------|------|-----|-------------------|-------|
| — | — | — | — | Store rollback docs in [../rollback/](../rollback/) |

---

## Legacy artifacts

Pre-framework engineering bundles remain valid reference material:

| Artifact | Date | Description |
|----------|------|-------------|
| [Production Hardening Release Session Bundle](../../evaluation/bamsignal-production-hardening-release-session-bundle.txt) | 2026-06-25 | Session-oriented hardening + Android AAB manufacture summary |

When backfilling history, extract version, commit, and status from legacy bundles into formal release records without deleting originals.

---

## Status definitions

| Status | Meaning |
|--------|---------|
| Draft | Record in progress |
| Ready | Checklists complete, awaiting approval |
| Approved | Authorized to deploy |
| Released | Production verified |
| Hotfix | Emergency patch release |
| Rolled Back | Superseded by rollback |
| Archived | Closed; see [../archive/](../archive/) |

---

## Related

- [Release Management System](../README.md)
- [Production release checklist](../checklists/production-release-checklist.md)
- [Deployment recovery runbook](../../runbooks/deployment-recovery.md)
