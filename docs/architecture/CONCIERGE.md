# Concierge Operations Architecture

## Scope

Sprint 5 adds an operational queue layer on top of existing `conciergeOperations.js` (Phase 3E).

Eligibility and membership remain in entitlements/commerce. This layer handles:

- Assignment queue
- Agent assignment and transfers
- Workload balancing
- VIP / urgent priority
- Escalation
- Completion tracking
- AI concierge hooks (placeholder)

## Tables

- `ops_concierge_queue_state` — queue entries linked to `concierge_members.id`
- `ops_concierge_assignment_log` — append-only assignment history

## Queue Statuses

queued → assigned → in_progress → awaiting_review → completed / escalated / closed

## Workload Balancing

`balanceConciergeWorkload()` selects agent with fewest active assignments.

## Integration

Existing concierge workflow (`concierge_case_events`, invoices, consultant assignment) unchanged. Queue layer coordinates ops visibility.

## Admin API

```
POST /api/operations/admin?action=concierge-queue
POST /api/operations/admin?action=concierge-enqueue
POST /api/operations/admin?action=concierge-assign
POST /api/operations/admin?action=concierge-complete
```

## Events

- `concierge.assigned`
- `concierge.completed`

## Metrics

Exposed via `getConciergeMetrics()` and admin dashboard contract.
