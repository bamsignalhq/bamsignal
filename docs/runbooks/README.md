# BamSignal disaster recovery runbooks

Operational playbooks for backup, restore, and recovery. **Documentation only** — no automated backup jobs ship in this repository.

| Runbook | Purpose |
|---------|---------|
| [database-backup.md](./database-backup.md) | Postgres / Supabase backup schedule and `pg_dump` |
| [database-restore.md](./database-restore.md) | Full and partial database restore |
| [storage-backup.md](./storage-backup.md) | Supabase Storage buckets (photos, voice) |
| [storage-restore.md](./storage-restore.md) | Storage restore and orphan handling |
| [deployment-recovery.md](./deployment-recovery.md) | Coolify rollback, restarts, env recovery |
| [payment-recovery.md](./payment-recovery.md) | Paystack ledger, webhooks, entitlements |

## Quick triage

| Incident | Start here |
|----------|------------|
| Site down / 503 | [deployment-recovery.md](./deployment-recovery.md) → `/ready` |
| Data deleted / corrupt | [database-restore.md](./database-restore.md) |
| Photos missing | [storage-restore.md](./storage-restore.md) |
| Paid but no premium | [payment-recovery.md](./payment-recovery.md) |
| Bad deploy | [deployment-recovery.md](./deployment-recovery.md) |

## Release management

Formal release records, checklists, and templates: [docs/releases/](../releases/README.md)

Production monitoring, SLOs, alerts, and observability: [docs/operations/monitoring/](../operations/monitoring/README.md)

## Secrets

All runbooks reference variable **names** from `.env.example` only. Store values in Coolify + password manager — never in git.

## Drill recommendation

Quarterly: restore latest `pg_dump` to staging Supabase, restore one storage bucket mirror, run `node scripts/verify-database.mjs` on staging only.
