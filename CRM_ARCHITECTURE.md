# CRM Architecture

BamSignal's CRM layer centers on **Signal Concierge members** — private, non-discover profiles stewarded by human consultants. It is distinct from the public Discover graph (`app_member_profiles`).

---

## Core record: `ConciergeMemberRecord`

**Type:** `src/types/conciergeConsultant.ts`  
**Store:** `src/utils/conciergeConsultantStore.ts`  
**Directory / stewardship:** `src/utils/conciergeConsultantDirectoryStore.ts`  
**Postgres:** `concierge_members` table

### Identity fields

| Field | Purpose |
|-------|---------|
| `id` | Member CRM ID |
| `journeyId` | Permanent `BS-JR-YYYY-NNNN` |
| `status` | `SignalConciergeStatus` pipeline stage |
| `preferredTier` | Concierge tier selection |
| `ownership` | `bamsignal` (institutional ownership) |

### Application payload

`application` — `SignalConciergeApplication` with personal details, preferences, values, consultation intent. Never shown on public Discover.

### Stewardship

| Field | Purpose |
|-------|---------|
| `currentConsultantId` | Active steward |
| `assignedConsultantId` | Initial assignment |
| `assignedBy`, `assignedAt` | Assignment audit |
| `stewardshipHistory` | Transfers between consultants |

### Operational data

| Field | Purpose |
|-------|---------|
| `communicationJournal` | Consultation notes, touchpoints |
| `privateNotes` | Internal consultant notes |
| `flags` | Ops flags (attention, compliance) |
| `consultantSummary` | AI/human summary block |
| `timeline` | Chronological CRM events |
| `introductions` | Linked introduction IDs |
| `followUpTasks` | Active follow-up references |
| `journeyArchive` | Post-relationship archive metadata |
| `relationshipLegacyIndex` | Legacy catalog entry |
| `successStoryConsent` | Published story consent |

---

## Related entities

| Entity | Store / table | ID format |
|--------|---------------|-----------|
| Consultants | `conciergeConsultantStore` / `concierge_consultants` | Text ID |
| Consultations | `ConsultationSchedulingEngine` / `concierge_consultations` | Text ID |
| Payments | `ConsultationPaymentEngine` / `concierge_consultation_payments` | `BS-PAY-YYYY-NNNN` |
| Introductions | `conciergeIntroductionStore` / `concierge_introductions` | `introduction_id` |
| Follow-ups | `relationshipFollowUpStore` / `concierge_follow_ups` | Per-record ID |
| Meeting notes | `concierge_meeting_notes` | `BS-MN-YYYY-NNNN` |
| Application reviews | `ApplicationApprovalEngine` / `concierge_application_reviews` | Review workflow |

---

## CRM UI surfaces

| Surface | Path | Audience |
|---------|------|----------|
| Concierge dashboard | `/hard/concierge` | Operations |
| Operations Center | `/hard/concierge/operations` | Operations |
| Member assignment | `MemberAssignmentSection` | Ops + matchmakers |
| Consultant CRM | `ConsultantDashboardPage` | Assigned consultant |
| Consultant workspace | `/consultant` portal | Consultant self-service |
| Journey intelligence | `/hard/concierge/intelligence` | Research / ops |
| Data integrity | `/hard/data-integrity` | Cross-system checks |

---

## Member-facing CRM touchpoints

Members interact with concierge CRM through:

| Route | Purpose |
|-------|---------|
| `/signal-concierge` | Landing / apply |
| `/signal-concierge/application` | Application form |
| `/signal-concierge/consultation` | Consultation booking |
| `/signal-concierge/dashboard` | Member concierge dashboard |
| `/signal-concierge/status` | Application status |

Member dashboard logic: `src/utils/memberDashboardLogic.ts` — timeline, journey health, status previews.

---

## Sync and persistence

**Client → server:** `POST /api/concierge-persistence`  
**Server:** `server/services/conciergePersistence.js` — upserts JSONB records, preserves journey IDs.

**Rule:** Concierge CRM data is **never deleted** from Postgres — archive and legacy transitions only.

---

## Permissions

| Action | Permission |
|--------|------------|
| View member CRM | `ViewMembers`, `ManageCrm` |
| Assign consultant | `AssignConsultants` |
| Transfer journey | `TransferJourney` |
| Approve application | `ApproveJourney` |
| Manage introductions | `ManageIntroductions` |
| Manage follow-ups | `ManageFollowUps` |
| View/manage archives | `ViewArchives`, `ManageArchives` |

See [PERMISSIONS.md](./PERMISSIONS.md).

---

## Related documents

- [JOURNEY_ENGINE.md](./JOURNEY_ENGINE.md)
- [OPERATIONS_CENTER.md](./OPERATIONS_CENTER.md)
- [CONSULTANT_WORKFLOW.md](./CONSULTANT_WORKFLOW.md)
