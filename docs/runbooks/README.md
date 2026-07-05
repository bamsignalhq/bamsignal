# BamSignal disaster recovery runbooks

Operational playbooks for backup, restore, and recovery. **Documentation only** — no automated backup jobs ship in this repository.

## Service runbooks

| Runbook | Purpose |
|---------|---------|
| [payment-recovery.md](./payment-recovery.md) | Paystack ledger, webhooks, entitlements |
| [wallet-recovery.md](./wallet-recovery.md) | Wallet gate, BayGold, purchase resume |
| [messaging-recovery.md](./messaging-recovery.md) | Chats, signals, message persistence |
| [notification-recovery.md](./notification-recovery.md) | Email, push, platform notifications |
| [support-escalation.md](./support-escalation.md) | Ticket → engineering → founder |
| [moderation-incidents.md](./moderation-incidents.md) | Reports, safety, photo queue |
| [incident-response.md](./incident-response.md) | P1 triage index |

## Infrastructure runbooks

| Runbook | Purpose |
|---------|---------|
| [database-backup.md](./database-backup.md) | Postgres / Supabase backup schedule and `pg_dump` |
| [database-restore.md](./database-restore.md) | Full and partial database restore |
| [storage-backup.md](./storage-backup.md) | Supabase Storage buckets (photos, voice) |
| [storage-restore.md](./storage-restore.md) | Storage restore and orphan handling |
| [configuration-backup.md](./configuration-backup.md) | Coolify env + feature flags |
| [secrets-recovery.md](./secrets-recovery.md) | API keys and rotation |
| [deployment-recovery.md](./deployment-recovery.md) | Coolify rollback, restarts, env recovery |

## Quick triage

| Incident | Start here |
|----------|------------|
| Site down / 503 | [incident-response.md](./incident-response.md) → [deployment-recovery.md](./deployment-recovery.md) |
| Data deleted / corrupt | [database-restore.md](./database-restore.md) |
| Photos missing | [storage-restore.md](./storage-restore.md) |
| Paid but no premium | [payment-recovery.md](./payment-recovery.md) |
| Wallet / BayGold stuck | [wallet-recovery.md](./wallet-recovery.md) |
| Bad deploy | [deployment-recovery.md](./deployment-recovery.md) |

## Monitoring & alerts

- [docs/operations/monitoring/alerts.md](../operations/monitoring/alerts.md)
- [docs/operations/monitoring/incident-escalation.md](../operations/monitoring/incident-escalation.md)
- [docs/operations/monitoring/runbooks.md](../operations/monitoring/runbooks.md)

## HQ documentation

- Stankings [PROGRAM-001-OPERATIONAL-MANUAL](https://github.com/bamsignalsm/stankings/blob/main/docs/bamsignal/operations/PROGRAM-001-OPERATIONAL-MANUAL.md) (sibling repo)
- Stankings [PROGRAM-001-RECOVERY-GUIDE](https://github.com/bamsignalsm/stankings/blob/main/docs/bamsignal/operations/PROGRAM-001-RECOVERY-GUIDE.md)

## Secrets

All runbooks reference variable **names** from `.env.example` only. Store values in Coolify + password manager — never in git.

## Drill recommendation

Quarterly: restore latest `pg_dump` to staging Supabase, restore one storage bucket mirror, run `node scripts/verify-database.mjs` on staging only, simulate wallet funding resume on staging.
