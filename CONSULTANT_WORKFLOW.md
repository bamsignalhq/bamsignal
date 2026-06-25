# Consultant Workflow

This document describes the end-to-end workflow for **Signal Concierge consultants** — from receiving an assignment through introduction, follow-up, and legacy handoff.

---

## Roles

| Role | Typical permissions |
|------|---------------------|
| Consultant | `AssignConsultants` (limited), journey view, introductions |
| Senior Matchmaker | Stronger assignment + introduction authority |
| Compatibility Specialist | Introduction-focused |
| Family Values Advisor | Values-aligned matching |
| Diaspora Consultant | Diaspora corridor expertise |
| Operations | Full `ManageOperations` — assignment queue override |

Role → permission map: `RolePermissions` in `src/constants/permissions.ts` via `governancePermissionEngine.ts`.

---

## Consultant surfaces

| Surface | Path | File |
|---------|------|------|
| Consultant portal | `/consultant/*` | `ConsultantPortalRoot` |
| Consultant dashboard | Admin concierge tab | `ConsultantDashboardPage` |
| Consultant workspace | Portal pages | `ConsultantWorkspacePage` |
| Regional team view | Portal | `RegionalTeamPage` |
| Academy | `/hard/academy` | Training modules |

---

## Workflow stages

### 1. Receive assignment

- Operations assigns via **Assignment Queue** (`OperationsCenterEngine` + `consultantAssignmentEngine`).
- Member record gets `currentConsultantId`, `assignedAt`, timeline event.
- Consultant sees member in **My capacity** (`ConsultantWorkloadCard`).

**Recommendation engine:** `recommendConsultantForMember()` considers workload, specialty, region.

### 2. Review application and journal

- Read `application` payload and `communicationJournal`.
- Application approval may be pending — `ApplicationApprovalEngine`.
- Private notes: append to `privateNotes` (not visible to member).

### 3. Conduct consultation

- Member books via `/signal-concierge/consultation`.
- Scheduling: `ConsultationSchedulingEngine` — WhatsApp, phone, Google Meet, Zoom.
- Payment: `ConsultationPaymentEngine` — ₦100,000 consultation fee via Paystack.
- Post-consultation: add meeting notes (`concierge_meeting_notes`), update journal.

### 4. Active search and introductions

- On approval: status → `active-search` → `introductions-in-progress`.
- Introduction Engine: create introduction record, consent workflow.
- Buckets: `awaiting-review` → `awaiting-consent` → `active` → `completed`.
- Permissions: `ManageIntroductions`.

### 5. Relationship follow-up

- Active relationships tracked in `relationshipFollowUpStore`.
- Health buckets: `healthy`, `needs-attention`, `paused`, `escalated`.
- `RelationshipHealthAlertsEngine` surfaces support queue items.
- Permissions: `ManageFollowUps`.

### 6. Milestones and archive

- Status progression: `matched` → `exclusive` → `engaged` → `married`.
- `archiveMemberJourney()` captures timeline and `journeyArchive`.
- Legacy: `relationshipLegacyIndex` for institutional catalog.
- Permissions: `ManageArchives`, `ManageLegacy`, `ManageSuccessStories`.

### 7. Stewardship transfer

When consultant unavailable (leave, capacity, specialty):

```
journeyTransitionMember(memberId, toConsultantId, reason)
```

Logged in `stewardshipHistory`. Permission: `TransferJourney`.

---

## Workload and capacity

| Component | File |
|-----------|------|
| Workload card (concierge) | `ConsultantWorkloadCard.tsx` (concierge/) |
| Workload card (workforce) | `ConsultantWorkloadCard.tsx` (workforce/) |
| Workforce management | `/hard/workforce` |
| Regional teams | `regionalConsultantEngine.ts` |

---

## Notifications

Consultants trigger or receive operational notifications via:

- **Email:** `POST /api/concierge-email` — `server/services/conciergeEmailService.js`
- **WhatsApp:** `POST /api/concierge-whatsapp` — Sendchamp templates in `src/constants/whatsappTemplates.ts`

Templates include consultation reminders, introduction accepted, follow-up reminders, milestone congratulations.

---

## Quality and performance

| Surface | Path |
|---------|------|
| Consultant quality | `/hard/quality` |
| Performance reviews | `performance-reviews` test suite |
| Consultant scorecard | `consultantPerformanceScorecard.js` |

---

## What consultants cannot do

- Access full admin command center without operator role.
- Delete concierge members or journey records.
- Expose member data on public Discover (concierge members are private by design).
- Bypass `COMMAND_CENTER_PIN` for destructive admin actions (operators only).

---

## Related documents

- [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md)
- [OPERATIONS_CENTER.md](./OPERATIONS_CENTER.md)
- [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md)
- [PERMISSIONS.md](./PERMISSIONS.md)
