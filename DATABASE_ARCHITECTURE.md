# Database Architecture

BamSignal uses **Postgres** (typically Supabase-hosted) via `DATABASE_URL`. The Node server is the primary application database client; the browser uses Supabase client SDK for member-facing features with RLS where applicable.

---

## Connection and bootstrap

| Component | File |
|-----------|------|
| Pool / connection | `server/db.js` |
| Startup init | `server/production.js` → `initDatabase()` |
| Schema verification | `server/services/schemaVerification.js` |
| Migrations runner | `scripts/run-migrations.mjs` (`npm run migrate`) |

**Readiness:** `GET /ready` returns **503** when `DATABASE_URL` is missing or ping fails (`server/services/readiness.js`).

**Local TLS:** Set `PGSSLMODE=disable` only for local Postgres without TLS.

---

## Migration sources

**Canonical authority:** `migrations/*.sql` via `npm run migrate` (and Coolify startup). See [docs/engineering/PLATFORM_GOVERNANCE.md](./docs/engineering/PLATFORM_GOVERNANCE.md).

| Directory | Role |
|-----------|------|
| `migrations/*.sql` | **Canonical** numbered history (`0001`…`0055` baseline; next `0056+`) |
| `supabase/migrations/*.sql` | Non-authoritative archive / CLI inspection only — **not** the write path |

```bash
npm run verify:migrations
npm run migrate
npm run verify:database
```

**Tracking table:** `schema_migrations` (`0001_schema_migrations.sql`).  
**Do not** edit historical migrations or use CLI `migration repair` / `db push` for repository issues.

---

## Core member schema

From `migrations/0002_baseline_bamsignal_schema.sql`:

| Table | Purpose |
|-------|---------|
| `app_users` | Canonical user row — `user_key`, premium flags, phone verification, onboarding |
| `app_member_profiles` | Discover profile payload (JSON columns) |
| `app_signals` | Signals sent between members |
| `app_matches` | Mutual matches |
| `app_messages` | Chat messages |
| `app_chat_threads` | Chat thread metadata |
| `app_saved_profiles` | Saved/liked profiles |
| `platform_settings` | Key-value platform config |
| `admin_users` | Operator allowlist (email, role) |
| `subscription_events` | Provider event log |
| `payment_fulfillments` | Paystack fulfillment ledger (idempotent by reference) |
| `payment_events` | Raw payment event stream |
| `rate_limit_events` | Auth throttle / rate limit retention |

Member identity for login is **username + PIN**; `app_users.user_key` is the stable member identifier used across sync APIs.

---

## Signal Concierge schema

From `migrations/0004_signal_concierge_persistence.sql` — **permanent persistence, no hard deletes**:

| Table | Purpose |
|-------|---------|
| `concierge_consultants` | Consultant records (`id`, `record` JSONB) |
| `concierge_members` | Journey members — `journey_id`, `status`, assignment, timeline |
| `concierge_consultation_payments` | Consultation fee payments (`BS-PAY-YYYY-NNNN`) |
| `concierge_consultations` | Scheduled/completed consultations |
| `concierge_meeting_notes` | Meeting notes (`BS-MN-YYYY-NNNN`) |
| `concierge_introductions` | Introduction records and consent pipeline |
| `concierge_follow_ups` | Relationship follow-up tasks |
| `concierge_application_reviews` | Application approval workflow |

**Journey ID constraint:** `journey_id ~ '^BS-JR-\d{4}-\d{4}$'` on `concierge_members`.

Server sync: `server/services/conciergePersistence.js` + `POST /api/concierge-persistence`.

---

## Institutional / operations schema

Added in migrations `0005`–`0020`:

| Migration | Domain |
|-----------|--------|
| `0005` | Workforce management |
| `0006` | Institutional governance |
| `0007` | Business continuity |
| `0008` | Finance operations |
| `0009` | Document center |
| `0010` | Consultant quality |
| `0011` | Configuration platform |
| `0012` | Monitoring center |
| `0013` | Data governance |
| `0014` | API platform |
| `0015` | Disaster recovery center |
| `0016` | Launch control |
| `0017` | Performance center |
| `0018` | Workflow engine |
| `0019` | Reporting center |
| `0020` | Institutional readiness verification |

Many institutional centers also use **client-side seed + store** patterns (`src/data/*Seed.ts`, `*Store.ts`) with optional Postgres backing where migrated.

---

## Supabase-specific concerns

| Concern | Handling |
|---------|----------|
| Auth users | Supabase `auth.users` — signup provisioning via service role |
| Photo storage | Buckets `profile-photos`, `cover-photos` — requires `SUPABASE_SERVICE_ROLE_KEY` |
| Security definer views | Fixed at startup via `server/fixSecurityDefinerViews.js` |
| Function `search_path` | Hardened via `server/fixFunctionSecurity.js` |

---

## Data integrity patterns

- **Payment idempotency:** Unique index on `payment_fulfillments.paystack_reference`.
- **Journey ID uniqueness:** Unique index on `concierge_members.journey_id`.
- **Rate limits:** `rate_limit_events` with retention indexes (`0003`).
- **Audit:** Institutional audit centers read from stores + DB; journey integrity in `src/utils/journeyIntegrityAudit.ts`.

Run `npm run audit:persistence` and `npm run audit:journeys` for automated checks.

---

## Environment variables (database)

| Variable | When required |
|----------|---------------|
| `DATABASE_URL` | Production readiness |
| `SUPABASE_URL` | Signup email, photo storage, JWT verify |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side user creation, storage uploads |
| `SUPABASE_ANON_KEY` | Member JWT verification on upload APIs |
| `PGSSLMODE` | Local dev only if needed |

Full list: `.env.example`

---

## Related documents

- [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md) — journey tables and lifecycle
- [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) — backup and restore
- [DEPLOYMENT.md](./DEPLOYMENT.md) — migrate on deploy
