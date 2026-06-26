# Consultant Operations

Signal Concierge and matchmaker workflows are coordinated through institutional admin surfaces.

## Primary surfaces

| Surface | Path | Purpose |
|---------|------|---------|
| Concierge hub | `/hard/concierge` | Consultant dashboard entry |
| Operations Center | `/hard/concierge/operations` | Consultations, payments, scheduling, assignments |
| Journey Intelligence | `/hard/concierge/intelligence` | Pipeline analytics |
| Consultant portal | `/consultant/*` | Day-to-day consultant UI |
| Workforce | `/hard/workforce` | Staffing and roles |
| Academy | `/hard/academy` | Consultant training content |

## Operations Center sections

1. **Consultations** — scheduled sessions across pipeline.
2. **Payments** — consultation fee lifecycle (Paystack).
3. **Scheduling** — calendar, slots, meeting links (Google Meet / Zoom when configured).
4. **Assignment Queue** — unassigned journeys, workload.
5. **Notifications** — delivery queues for concierge comms.
6. **Introductions** — Introduction Engine™ consent pipeline.
7. **Relationship Follow-up** — stewardship and escalations.
8. **Regional Teams** — director coverage and assignments.

## Daily operations rhythm

- Morning: clear assignment queue, review consultations for today.
- Midday: payment exceptions and scheduling conflicts.
- Evening: follow-up tasks and introduction approvals.

## Permissions

Consultant roles are distinct from member accounts. Hard console access requires explicit permissions — see `src/constants/permissions.ts` and governance engine.

## Quality

Consultant quality reviews: `/hard/quality` (Consultant Quality). Escalations with `executive-review` bucket go to leadership.

## Data integrity

Do not fabricate journeys or profiles in production. Use existing engines only; certification E2E uses `cert.bamsignal.com` test emails with diagnostics peek/cleanup.
