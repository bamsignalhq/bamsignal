# BamSignal Platform Governance

**Status:** ACTIVE  
**Effective baseline:** Recovery Baseline — July 2026  
**Repository:** `bamsignalhq/bamsignal`  
**Supabase project:** `nswiwxmavuqpuzlsascs`

This document is the permanent engineering governance layer for database and deployment work. Forensic history lives under `audit/` (including `audit/RECOVERY_COMPLETION.md` and `audit/CANONICAL_DATABASE_ARCHITECTURE.md`).

---

## Canonical migration authority

**`migrations/` is the ONLY canonical migration source.**

| Path | Role |
|------|------|
| `migrations/*.sql` | Canonical history — applied by `npm run migrate` / Coolify startup |
| `public.schema_migrations` | Apply ledger (filename stem = ID) |
| `supabase/migrations/` | Non-authoritative archive / local CLI artifacts only |

Every schema change requires a **new** numbered file under `migrations/`. Never edit applied history.

---

## Deployment flow

```
Developer
    ↓
Create migration (NNNN_description.sql)
    ↓
npm run migrate
    ↓
Commit
    ↓
PR
    ↓
Merge
    ↓
Coolify
    ↓
Production
```

No direct production SQL. No manual DDL. No production hotfixes unless emergency procedures are explicitly invoked (and always followed by a forward migration).

---

## Historical migration policy

Applied migrations are **immutable**.

Never:

- edit historical migration files
- renumber migrations
- squash applied migrations
- rewrite migration history
- delete applied migration files
- use Supabase CLI `migration repair` to “fix” repository problems

---

## Supabase CLI policy

**Allowed:**

- inspect (`migration list`, status)
- verify / link (with project guard)
- local development
- schema export / dump
- debugging

**Not allowed as canonical authority:**

- `supabase db push` for BamSignal production schema
- treating CLI history as the source of truth
- repository repair via CLI metadata tools

Identity check before linked CLI work:

```bash
npm run verify:supabase-project -- --require-linked
```

---

## CI policy

Every PR must pass:

| Gate | Command |
|------|---------|
| Project identity | `npm run verify:supabase-project` |
| Migration integrity | `npm run verify:migrations` |
| Typecheck / lint | `npm run lint` |
| Server smoke | `npm run test:server-import` |
| Production build | `npm run build` |

Reject the merge if any gate fails.

---

## Migration numbering

| Item | Value |
|------|-------|
| Recovery / governance baseline | **0055** (`0055_retire_stankings_auth_trigger`) |
| Next migration | **0056** onward |
| Intentional unused numbers | `0040`–`0047` (documented; do not fill casually) |

Filename format: `NNNN_snake_case_description.sql` (four-digit zero-padded prefix).

---

## Emergency procedures

1. Stabilize production with the minimum safe change.
2. Record the change as a **new forward migration** under `migrations/` as soon as possible.
3. Never rewrite or renumber history to “catch up.”
4. Prefer Coolify redeploy after the forward migration is merged.

---

## Related documents

| Document | Role |
|----------|------|
| [PROJECT_IDENTITY.md](./PROJECT_IDENTITY.md) | App / Supabase ref identity |
| [../CONTRIBUTING.md](../../CONTRIBUTING.md) | Developer workflow + checklists |
| [../DATABASE_ARCHITECTURE.md](../../DATABASE_ARCHITECTURE.md) | Schema overview |
| [../DEPLOYMENT.md](../../DEPLOYMENT.md) | Coolify deploy |
| `audit/RECOVERY_COMPLETION.md` | July 2026 recovery baseline record |
