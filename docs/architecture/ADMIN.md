# Admin Operations Architecture

Sprint 5 formalizes BamSignal operational backend so administrators never need direct database access.

## Repository Context

| Field | Value |
|-------|-------|
| Repository | bamsignalhq/bamsignal |
| Supabase | nswiwxmavuqpuzlsascs |
| Migration | `0062_admin_operations_core.sql` |
| API | `POST /api/operations/admin` |

## Domain Audit (Part 1)

### Active Systems (retained)

| Domain | Location | Status |
|--------|----------|--------|
| Admin auth | `server/adminAuth.js` | Production — Supabase + automation secret |
| Shadow ban / reports | `server/services/moderation.js` | Production — extended by ops layer |
| Concierge workflow | `server/services/conciergeOperations.js` | Production — queue layer added |
| Platform audit | `server/services/auditTrail.js`, `auditLog.js` | Production — immutable ops audit added |
| Feature flags (UI) | `server/services/featureFlagPlatform.js` | Production — runtime config backend added |
| Operator dashboard | `server/services/operatorDashboardContract.js` | Extended with operations metrics |
| Admin API routes | `api/admin/*` | Production — legacy routes preserved |
| Finance admin | `api/finance/admin.js` | Production |
| Messaging admin | `api/messaging/admin.js` | Production |

### Duplicate / Parallel Systems

| Legacy | Sprint 5 Canonical | Notes |
|--------|-------------------|-------|
| `moderation_audit_log` | `ops_immutable_audit_log` | Legacy retained; new writes go to both via hooks |
| `listReportQueue()` heuristic status | `ops_moderation_report_state` | Formal lifecycle replaces inferred status |
| Frontend `permissions.ts` roles | `ops_admin_role_assignments` | UI roles unchanged; backend roles formalized |
| `feature_flags` table (0021) | `ops_runtime_configuration` | Runtime ops keys; product flags unchanged |

### Dead Code

No production consumers removed in Sprint 5. Institutional admin UI modules remain for existing console tabs.

## Role Model (Part 2)

Nine operational roles in `server/services/operations/roles.js`:

- Super Admin
- Platform Administrator
- Operations Administrator
- Moderator
- Concierge Agent
- Support Agent
- Finance Administrator
- Trust Administrator
- Read Only Auditor

Permission changes append to `ops_admin_role_audit_log`.

## Module Layout

```
server/services/operations/
  roles.js          — role model and assignments
  moderation.js     — report lifecycle engine
  userSafety.js     — suspend, lock, review actions
  support.js        — ticket lifecycle
  concierge.js      — assignment queue and metrics
  audit.js          — immutable audit platform
  featureFlags.js   — runtime configuration
  eventBus.js       — admin operations events
  observability.js  — workload and SLA metrics
  dashboard.js      — admin dashboard contract
  index.js          — unified exports and hooks
```

## Hooks

- `persistReport()` → `handleReportSubmittedEvent()` creates moderation queue entry
- Safety actions → immutable audit + admin event bus
- Feature flag updates → configuration audit + events

## Escalation

Escalation authority defined per role in `ESCALATION_AUTHORITY`. Approval authority for irreversible actions in `APPROVAL_AUTHORITY`.
