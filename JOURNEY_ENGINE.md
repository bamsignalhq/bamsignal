# Journey Engine

The Journey Engine is BamSignal's **Signal Concierge™** identity and lifecycle system. Every concierge member receives a permanent **Journey ID** that tracks the relationship from application through legacy archive.

**Format:** `BS-JR-YYYY-NNNN` (e.g. `BS-JR-2026-0042`)

---

## Key files

| File | Role |
|------|------|
| `src/constants/journeyId.ts` | ID format, validation, parsing |
| `src/utils/conciergeJourneyRegistry.ts` | Client registry — assign IDs, prevent duplicates |
| `server/services/journeyId.js` | Server-side ID mirror |
| `src/utils/conciergeJourneyArchive.ts` | Archive transitions, timeline events |
| `src/constants/conciergeJourneyArchive.ts` | Relationship status types |
| `src/utils/journeyIntegrityAudit.ts` | Stage checks for audit dashboard |
| `src/utils/SignalConciergeOperationsEngine.ts` | Operation stage derivation |
| `server/services/journeyArchive.js` | Server archive helpers |
| `server/services/conciergePersistence.js` | Postgres persistence |

---

## Journey ID assignment

1. On member creation, `assignJourneyIdForMember()` in `conciergeJourneyRegistry.ts` runs.
2. Year comes from member `createdAt`; sequence increments per year (`yearCounters`).
3. Registry stored in local storage key `STORAGE_KEYS.conciergeJourneyRegistry` and synced to `concierge_members.journey_id` in Postgres.
4. DB enforces format: `^BS-JR-\d{4}-\d{4}$`.

**Rule:** One journey ID per member — `memberIndex` maps `memberId → journeyId`.

---

## Member status lifecycle

Defined in `src/constants/signalConcierge.ts` as `SignalConciergeStatus`:

```
applied
  → consultation-scheduled
  → under-review
  → accepted | waitlisted
  → active-search
  → introductions-in-progress
  → relationship → matched → exclusive → engaged → married
  → legacy-archive

Branches: paused, closed
```

Labels: `SIGNAL_CONCIERGE_STATUS_LABELS`.

---

## Operation stages (admin pipeline)

`deriveOperationStageFromMember()` in `SignalConciergeOperationsEngine.ts` maps member state to operation stages:

| Stage | Typical trigger |
|-------|-----------------|
| `application-received` | New application |
| `consultation-scheduled` | `consultationScheduledAt` set |
| `consultation-completed` | Completed consultation journal |
| `consultant-assignment` | `assignedConsultantId` / `currentConsultantId` |
| `application-review` | `status === under-review` |
| `approved` | `accepted`, `waitlisted`, `active-search` |
| `introduction-process` | `introductions-in-progress` |
| `relationship-follow-up` | `relationship`, `matched`, `exclusive`, `engaged` |
| `marriage` | `married` or archive married |
| `legacy-archive` | `legacy-archive` or `journeyArchive.isLegacyArchive` |

---

## Journey integrity stages (audit)

`journeyIntegrityAudit.ts` checks these stages per member:

1. application  
2. consultation  
3. assignment  
4. introduction  
5. follow-up  
6. relationship  
7. archive  
8. legacy (`relationshipLegacyIndex`)  
9. success-story  
10. milestones  
11. family  
12. quotes  
13. events  

Audit UI: `/hard/audit/journeys` (`JourneyIntegrityAuditPage`).

---

## Archive and legacy

**Relationship archive statuses** (`RelationshipJourneyStatus` in `conciergeJourneyArchive.ts`):

- `matched`, `exclusive`, `engaged`, `married`, `legacy-archive`

`archiveMemberJourney()` in `conciergeJourneyArchive.ts`:

- Appends timeline events (engagement, marriage, archived).
- Sets `journeyArchive` on `ConciergeMemberRecord`.
- Registers member in archive index via `registerArchivedMember()`.

**Legacy index:** `relationshipLegacyIndex` — institutional legacy catalog (`RelationshipLegacyIndexPage`).

---

## Persistence model

`ConciergeMemberRecord` (TypeScript) maps to `concierge_members` row:

| Field | Storage |
|-------|---------|
| `id`, `journeyId`, `status` | Columns |
| `application`, `photos`, `timeline` | JSONB |
| `currentConsultantId`, `assignedAt` | Assignment |
| `stewardshipHistory`, `communicationJournal` | JSONB arrays |
| `journeyArchive` | Embedded in record / timeline |

Sync API: `POST /api/concierge-persistence` — server merges into Postgres without deleting rows.

---

## Stewardship transfer

`journeyTransitionMember()` in `conciergeConsultantDirectoryStore.ts` moves a journey between consultants with reason logged in `stewardshipHistory`.

Requires permission: `TransferJourney` (see [PERMISSIONS.md](./PERMISSIONS.md)).

---

## Related documents

- [OPERATIONS_CENTER.md](./OPERATIONS_CENTER.md) — operational view of journeys
- [CRM_ARCHITECTURE.md](./CRM_ARCHITECTURE.md) — member CRM record
- [CONSULTANT_WORKFLOW.md](./CONSULTANT_WORKFLOW.md) — consultant-facing steps
- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) — `concierge_*` tables
