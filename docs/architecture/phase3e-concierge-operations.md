# Phase 3E — Concierge Operations

**Status:** Operational workflow shipped (not matching).  
**Depends on:** 3C eligibility (capabilities), 3D commerce (membership grant).  
**Does not modify:** Journey UX, Privacy, Entitlements, Membership Commerce.

---

## Architecture

```
Eligibility (Entitlements — 3C)
    ↓ (capability: concierge / purchase_concierge)
Operations Layer (this phase)
    ├── Case workflow (state machine)
    ├── Consultant assignment / transfer / notes
    ├── Case invoices (request payment only)
    └── Immutable case events
Billing settlement
    └── Invoice paid → case progress (NO membership grant)
Matching / Discover / Journey
    └── Out of scope (unchanged)
```

**Separation:**

| Concern | Owner |
|---|---|
| Eligibility | Entitlements (3C) |
| Membership purchase | Commerce (3D) |
| Application → completion workflow | **Concierge Operations (3E)** |
| Invoice payment request | Operations invoices |
| Matching / introductions | Existing Concierge tools (not this layer) |

---

## Case model

A Concierge **case** is the `concierge_members` row plus:

- `ops_status` — operational source of truth
- `concierge_case_events` — immutable audit trail
- `concierge_invoices` — belong to the case via `member_id` / `journey_id`

Legacy `status` is kept in sync for existing admin UI labels (e.g. `under-review`, `active-search`) but operations transitions go through `ops_status`.

---

## State machine

```
applied
  → under_review
      → accepted → assigned → in_progress → completed
      → rejected → (reopen) under_review
  → closed

completed → (reopen) in_progress
closed    → (reopen) under_review | in_progress
assigned  → assigned (consultant transfer)
```

| Action | Transition |
|---|---|
| New application | → `applied` |
| Start review | `applied` → `under_review` |
| Accept | `under_review` → `accepted` |
| Reject | `under_review` / `accepted` → `rejected` |
| Assign / transfer consultant | → `assigned` |
| Progress / paid invoice | `assigned` → `in_progress` |
| Complete | → `completed` |
| Reopen | `completed`/`rejected`/`closed` → allowed reopen target |

---

## Invoices

- Created only when case is `assigned`, `in_progress`, or `completed`
- Line items sum to `total_kobo`
- Payment marks invoice `paid` / `partially_paid`
- **`grantsMembership: false` always** — payment does not call commerce or entitlements

---

## Admin API

`POST /api/concierge-operations?action=...` (admin auth)

Actions: `list-cases`, `get-case`, `submit-application`, `start-review`, `accept`, `reject`, `assign-consultant`, `transfer-consultant`, `add-note`, `record-progress`, `create-invoice`, `mark-invoice-paid`, `cancel-invoice`, `complete`, `close`, `reopen`, `set-status`

---

## Files

| File | Role |
|---|---|
| `shared/conciergeOperationsHelpers.mjs` | Status / event registry + state machine |
| `migrations/0053_concierge_operations.sql` | `ops_status`, `concierge_case_events`, invoice payment columns |
| `server/services/conciergeOperations.js` | Workflow engine |
| `server/routes/conciergeOperations.js` | Admin HTTP surface |
| `server/app.js` | Mount `/api/concierge-operations` |
| `scripts/test-concierge-operations.mjs` | Workflow matrix |
| `docs/architecture/phase3e-concierge-operations.md` | This doc |

---

## Regression risks

- Existing members without `ops_status` derive status from legacy `status` until migration backfill runs.
- Mapping `completed` → member `matched` and `in_progress` → `active-search` is intentional compatibility — matching UI may show those labels without ops owning introductions.
- Invoice payment path must never be wired into Payment Fortress membership activation without an explicit future integration pass.
