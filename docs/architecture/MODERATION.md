# Moderation Engine Architecture

## Report Lifecycle

Ten append-only states in `ops_moderation_report_state`:

1. submitted
2. triaged
3. assigned
4. investigating
5. awaiting_response
6. action_taken
7. resolved
8. dismissed
9. appealed
10. closed

Every transition writes to `ops_moderation_lifecycle_log`.

## Evidence and Notes

- `ops_moderation_evidence` — attachments and proof
- `ops_moderation_internal_notes` — moderator-only notes

## Integration

| Trigger | Handler |
|---------|---------|
| Member report | `memberPersistence.persistReport` → `handleReportSubmittedEvent` |
| Shadow ban | `userSafety.applyShadowBanOperation` → legacy `moderation.js` + ops audit |
| Message report | `messaging/moderation.js` (Sprint 4) — separate chat moderation events |

## Risk Score

`risk_score` placeholder on report state (numeric, default 0). Future Trust Engine integration.

## Appeals

`submitModerationAppeal()` transitions to `appealed`. Review returns to `investigating` or `resolved`.

## Admin API

```
POST /api/operations/admin?action=moderation-queue
POST /api/operations/admin?action=moderation-transition
POST /api/operations/admin?action=moderation-assign
POST /api/operations/admin?action=moderation-evidence
POST /api/operations/admin?action=moderation-appeal
```

## Events

- `report.created`
- `report.assigned`
- `report.closed`
