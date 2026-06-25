# Operations Center

The **Signal Concierge Operations Center™** is the operational command surface for concierge pipeline management — consultations, payments, scheduling, assignments, notifications, introductions, follow-up, and regional teams.

**Route:** `/hard/concierge/operations`  
**Constant:** `OPERATIONS_CENTER_PATH` in `src/constants/operationsCenter.ts`  
**Permission:** `ManageOperations` (concierge view: `operations-center`)

---

## Key files

| File | Role |
|------|------|
| `src/components/admin/concierge/OperationsCenterPage.tsx` | UI shell |
| `src/utils/OperationsCenterEngine.ts` | Aggregates all operational data |
| `src/constants/operationsCenter.ts` | Sections, metrics, bucket definitions |
| `src/types/operationsCenter.ts` | Row/bundle types |
| `scripts/test-operations-center.mjs` | Verification tests |

---

## Sections

| Section ID | Label | Data source |
|------------|-------|-------------|
| `consultations` | Consultations | `ConsultationSchedulingEngine`, review summaries |
| `payments` | Payments | `ConsultationPaymentEngine` |
| `scheduling` | Scheduling | Calendar slots, `MeetingInfrastructureEngine` |
| `assignment-queue` | Assignment Queue | `consultantAssignmentEngine` |
| `notifications` | Notifications | `notificationOperationsEngine` |
| `introductions` | Introductions | `conciergeIntroductionStore` |
| `follow-up` | Relationship Follow-up | `relationshipFollowUpStore` |
| `regional-teams` | Regional Teams | `regionalConsultantEngine` |

---

## Metrics dashboard

`OPERATIONS_CENTER_METRICS` tracks funnel counts:

- Applications  
- Consultations  
- Payments  
- Assignments  
- Introductions  
- Relationships  
- Engagements  
- Marriages  
- Legacy Families  

Computed in `OperationsCenterEngine.ts` from member records, introductions, follow-ups, and legacy index.

---

## Bucket filters

### Consultations

`upcoming` | `completed` | `no-show` | `cancelled` | `rescheduled`

### Payments

`pending` | `initialized` | `paid` | `refunded` | `failed` | `cancelled`

### Introductions

`awaiting-review` | `awaiting-consent` | `active` | `completed`

### Follow-up

`needs-attention` | `paused` | `healthy` | `escalated`

---

## Data flow

```
concierge_members (Postgres)
        │
        ├─▶ listConciergeMembers() ──▶ OperationsCenterEngine
        │
        ├─▶ ConsultationPaymentEngine ──▶ payment rows
        ├─▶ ConsultationSchedulingEngine ──▶ scheduling rows
        ├─▶ consultantAssignmentEngine ──▶ workload + recommendations
        ├─▶ conciergeIntroductionStore ──▶ introduction rows
        ├─▶ relationshipFollowUpStore ──▶ follow-up rows
        └─▶ notificationOperationsEngine ──▶ delivery queue metrics
                │
                ▼
        OperationsCenterBundle → OperationsCenterPage UI
```

**Refresh:** In-memory stores hydrate from seed data in dev; production uses concierge persistence sync to Postgres.

---

## Assignment queue

Powered by `consultantAssignmentEngine.ts`:

- `buildAssignmentSummary()` — unassigned members, queue depth  
- `listConsultantWorkloadProfiles()` — capacity per consultant  
- `recommendConsultantForMember()` — assignment recommendation  

UI cards: `AssignmentQueueCard`, `ConsultantWorkloadCard`, `AssignmentRecommendationCard`.

---

## API dependencies

| API | Purpose |
|-----|---------|
| `POST /api/consultation-payments` | Paystack consultation fees |
| `POST /api/consultation-scheduling` | Calendar booking |
| `GET/POST /api/calendar` | Google Calendar OAuth + events |
| `POST /api/meeting-infrastructure` | Zoom / Meet links |
| `POST /api/concierge-email` | Operational email |
| `POST /api/concierge-whatsapp` | Sendchamp WhatsApp templates |
| `POST /api/concierge-persistence` | Persist concierge records |

---

## Related admin surfaces

| Surface | Path |
|---------|------|
| Concierge dashboard | `/hard/concierge` |
| Journey intelligence | `/hard/concierge/intelligence` |
| Notification queue | `/hard/notifications` |
| Workforce | `/hard/workforce` |

---

## Related documents

- [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md)
- [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md)
- [CONSULTANT_WORKFLOW.md](./CONSULTANT_WORKFLOW.md)
