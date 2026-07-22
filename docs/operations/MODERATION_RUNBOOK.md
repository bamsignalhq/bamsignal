# Moderation Runbook

## Report Intake

Member reports flow automatically:

```
Member report → app_reports → handleReportSubmittedEvent → ops_moderation_report_state (submitted)
```

## Triage Workflow

1. List queue: `action=moderation-queue&status=submitted`
2. Triage: `action=moderation-transition` → `triaged`
3. Assign: `action=moderation-assign`
4. Add evidence: `action=moderation-evidence`
5. Internal note: `action=moderation-note`

## Safety Actions

All require `reason`:

```
action=suspend-member | shadow-ban | temporary-lock | permanent-lock
```

Each action creates:

- `ops_user_safety_action_log` entry
- `ops_immutable_audit_log` entry
- Admin event (`user.suspended` / `user.restored`)

## Appeals

1. Member appeal → `action=moderation-appeal`
2. Review → transition to `investigating` or `resolved`
3. Close → `closed`

## Shadow Ban (Legacy + Ops)

`shadow-ban` action delegates to `server/services/moderation.js` then records ops audit.

## Moderator Workload

Monitor via dashboard contract `moderation.queueDepth` and `operations.moderatorWorkload`.

## Certification Journey

Automated path validated by `npm run certify:operations-journey`:

Report → triage → assign → evidence → suspend → audit → appeal → close

## Do Not

- Edit audit records directly
- Skip reason on safety actions
- Bypass permission checks in production tooling
