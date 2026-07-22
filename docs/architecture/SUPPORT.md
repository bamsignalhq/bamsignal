# Customer Support Platform Architecture

## Ticket Lifecycle

Eight states with append-only log in `ops_support_lifecycle_log`:

- open
- assigned
- awaiting_member
- awaiting_staff
- resolved
- closed
- reopened
- escalated

## Tracking

| Field | Table |
|-------|-------|
| Priority | `ops_support_ticket_state.priority` |
| Category | `ops_support_ticket_state.category` |
| Owner | `ops_support_ticket_state.owner_email` |
| Internal notes | `ops_support_internal_notes` |
| SLA timer | `sla_due_at` (auto-set by priority) |
| Response timer | `first_response_at` |
| Resolution timer | `resolved_at` |
| Satisfaction | `satisfaction_score` (placeholder) |

## SLA Defaults

| Priority | SLA hours |
|----------|-----------|
| urgent | 4 |
| high | 12 |
| normal | 24 |
| low | 72 |

## Admin API

```
POST /api/operations/admin?action=create-ticket
POST /api/operations/admin?action=support-queue
POST /api/operations/admin?action=assign-ticket
POST /api/operations/admin?action=transition-ticket
POST /api/operations/admin?action=escalate-ticket
```

## Events

- `ticket.created`
- `ticket.updated`
- `ticket.closed`

## Future

Member-facing help center should call `createSupportTicket` — not yet wired in Sprint 5 (backend only).
