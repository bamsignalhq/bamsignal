# Supabase & Persistence Audit™

Generated: 2026-06-25T02:01:50.424Z

## Executive Summary

Static persistence audit across institutional domains, Postgres migrations, localStorage dependencies, and server-side concierge persistence.

**Baseline Postgres tables:** 41  
**Concierge migration tables:** 12  
**Startup-verified tables:** 41  
**Concierge tables not verified at startup:** 12  
**Admin localStorage dependencies:** 15  
**Additional institutional storage keys scanned:** 120  
**Mock/stub repositories:** 7  
**Automated check failures:** 0

Live audit: `/hard/audit/database` (Database Audit Center™).

## Persistence Report

### Domain status

| Domain | Status | Postgres tables | localStorage deps |
| --- | --- | --- | --- |
| Members | partial | concierge_members, app_users, app_member_profiles | 1 |
| Consultants | healthy | concierge_consultants | 0 |
| Applications | partial | concierge_members | 1 |
| Introductions | partial | concierge_introductions, member_introductions | 1 |
| Follow-ups | healthy | concierge_followups | 0 |
| Archives | partial | concierge_archives | 1 |
| Legacy Profiles | partial | concierge_legacy_profiles, success_stories, concierge_success_story_consents | 1 |
| Support Tickets | needs-migration | — | 1 |
| Safety Cases | needs-migration | — | 1 |
| Notifications | partial | concierge_notifications | 2 |
| Documents | needs-migration | — | 1 |
| Payments | partial | concierge_consultation_payments, payment_events, payment_fulfillments | 1 |
| Meetings | healthy | concierge_consultations, concierge_meeting_notes | 0 |


### Concierge Postgres migration (0004)

| Feature | Count / status |
| --- | --- |
| Tables | 12 |
| Foreign keys → concierge_members | 8 |
| Indexes | 10 |
| No-delete triggers | 2 |
| Immutability triggers | 9 |
| Row Level Security | Not configured |
| Cascade rules | ON DELETE not used — append-only via prevent_delete triggers |

**Server persistence:** `server/services/conciergePersistence.js` writes members, introductions, follow-ups, archives, legacy, payments, consultations, meeting notes, notifications.

**Client persistence:** Repository layer uses `noopSupabaseWrite` — localStorage remains source of truth in browser.

## LocalStorage Inventory

### Admin institutional engines (manifest)

| Storage key | Domain | Engine | Expected Postgres table | Mode |
| --- | --- | --- | --- | --- |
| bamsignal.documentCenter.v1 | documents | documentCenterEngine.ts | none | local-only |
| bamsignal.supportCenter.v1 | support | supportCenterEngine.ts | none | local-only |
| bamsignal.safetyCenter.v1 | safety | safetyCenterEngine.ts | none | local-only |
| bamsignal.talentRecruiting.v1 | careers | talentRecruitingEngine.ts | none | local-only |
| bamsignal.consultantAcademy.v1 | academy | consultantAcademyEngine.ts | none | local-only |
| bamsignal.consultantQuality.v1 | qa | consultantQualityEngine.ts | none | local-only |
| bamsignal.financeOperations.v1 | finance | financeOperationsEngine.ts | payment_fulfillments | dual-write |
| bamsignal.auditCenter.v1 | qa | auditCenterEngine.ts | audit_logs | dual-write |
| bamsignal.internalMessaging.v1 | notifications | internalMessagingEngine.ts | none | local-only |
| bamsignal-concierge-journey-registry | members | conciergeConsultantStore.ts | concierge_members | dual-write |
| bamsignal-concierge-introduction-registry | introductions | conciergeIntroductionStore.ts | concierge_introductions | dual-write |
| bamsignal-concierge-journey-archive | archives | conciergeJourneyArchive.ts | concierge_archives | dual-write |
| bamsignal-concierge-relationship-legacy-index | legacy | relationshipLegacyIndexStore.ts | concierge_legacy_profiles | dual-write |
| bamsignal-concierge-notification-store | notifications | SignalConciergeNotificationEngine.ts | concierge_notifications | dual-write |
| bamsignal-concierge-consultation-payment-store | payments | ConsultationPaymentEngine.ts | concierge_consultation_payments | dual-write |


### Concierge operational stores (STORAGE_KEYS)

- bamsignal-concierge-journey-registry
- bamsignal-concierge-journey-archive
- bamsignal-concierge-success-story-consent
- bamsignal-concierge-journey-story-profile
- bamsignal-concierge-journey-milestone-timeline
- bamsignal-concierge-relationship-legacy-index
- bamsignal-concierge-introduction-registry
- bamsignal-concierge-operations-registry
- bamsignal-concierge-operations-store
- bamsignal-concierge-consultation-scheduler
- bamsignal-concierge-calendar-store
- bamsignal-concierge-scheduling-availability-store
- bamsignal-concierge-meeting-link-store
- bamsignal-concierge-consultation-meeting-registry
- bamsignal-concierge-consultation-payment-store
- bamsignal-concierge-consultation-payment-registry
- bamsignal-concierge-notification-store
- bamsignal-concierge-notification-registry
- bamsignal-concierge-meeting-notes-store
- bamsignal-concierge-meeting-notes-registry
- bamsignal-concierge-consultation-review-store
- bamsignal-concierge-consultation-review-registry
- bamsignal-concierge-application-approval-store
- bamsignal-concierge-application-approval-registry
- bamsignal-concierge-email-store
- bamsignal-concierge-email-registry
- bamsignal-concierge-whatsapp-store
- bamsignal-concierge-whatsapp-registry


## Mock Repositories

Client concierge repositories delegate Supabase to noop stubs pending migration cutover:

- `src/services/concierge/consultantRepository.ts`
- `src/services/concierge/conciergeMemberRepository.ts`
- `src/services/concierge/introductionRepository.ts`
- `src/services/concierge/followupRepository.ts`
- `src/services/concierge/archiveRepository.ts`
- `src/services/concierge/legacyProfileRepository.ts`
- `src/services/concierge/successStoryConsentRepository.ts`


`conciergeRepositoryShared.ts` documents stale table name constants — server uses `concierge_*` prefix from migration 0004.

## Migration Gaps

| Domain | Status | Summary |
| --- | --- | --- |
| Members | partial | Postgres migration exists; localStorage engines still hold parallel state |
| Applications | partial | Postgres migration exists; localStorage engines still hold parallel state |
| Introductions | partial | Postgres migration exists; localStorage engines still hold parallel state |
| Archives | partial | Postgres migration exists; localStorage engines still hold parallel state |
| Legacy Profiles | partial | Postgres migration exists; localStorage engines still hold parallel state |
| Support Tickets | needs-migration | Admin engine localStorage-only — no dedicated Postgres table |
| Safety Cases | needs-migration | Admin engine localStorage-only — no dedicated Postgres table |
| Notifications | partial | Postgres migration exists; localStorage engines still hold parallel state |
| Documents | needs-migration | Admin engine localStorage-only — no dedicated Postgres table |
| Payments | partial | Postgres migration exists; localStorage engines still hold parallel state |


### Concierge tables awaiting startup verification

- concierge_consultants
- concierge_members
- concierge_consultation_payments
- concierge_consultations
- concierge_meeting_notes
- concierge_introductions
- concierge_followups
- concierge_archives
- concierge_legacy_profiles
- concierge_success_story_consents
- concierge_notifications
- concierge_relationship_health_alerts


### Missing Postgres tables (admin domains)

- concierge_documents — Document Center™
- concierge_safety_incidents — Safety Center™
- concierge_careers_candidates — Talent admin
- concierge_academy_progress — Consultant Academy™
- concierge_quality_reviews — Quality Assurance™
- concierge_finance_records — Finance Operations mirror


## Database Risks

| Severity | Risk | Detail |
| --- | --- | --- |
| High | Concierge schema not in startup verification | 12 concierge_* tables missing from REQUIRED_SCHEMA_TABLES |
| High | Client repositories still noop Supabase | conciergeRepositoryShared.ts returns migration_not_enabled — reads/writes stay in localStorage |
| Medium | No RLS on concierge tables | Access control is server-only via requireAdmin; direct Supabase client access would be unscoped |
| Medium | Parallel audit table families | audit_logs, platform_audit_log, moderation_audit_log overlap |
| Medium | Dual introduction/legacy stores | member_introductions vs concierge_introductions; success_stories vs concierge_success_story_consents |
| Low | Backups are operator-managed | No in-app backup job — Supabase PITR and pg_dump per docs/runbooks/database-backup.md |


### Duplicate table families

- audit_logs ↔ platform_audit_log ↔ moderation_audit_log
- member_introductions ↔ concierge_introductions
- success_stories ↔ concierge_success_story_consents


## Index & Foreign Key Verification

Migration `0004_signal_concierge_persistence.sql` defines:

- Unique `journey_id` index on `concierge_members`
- Unique `introduction_id`, `notification_id`, `note_id`, `payment_id` indexes
- Member-scoped indexes on payments, consultations, introductions, follow-ups, meeting notes
- FK references from child tables to `concierge_members(id)`
- Journey ID format CHECK constraint on members

## Backup Verification

| Check | Status |
| --- | --- |
| Database backup runbook | `docs/runbooks/database-backup.md` |
| Storage backup runbook | `docs/runbooks/storage-backup.md` |
| In-app automated backup | Not shipped — operator responsibility |
| Supabase PITR | Documented in runbook |
| pg_dump procedure | Documented |

## Recommendations

- Add concierge_* tables to REQUIRED_SCHEMA_TABLES in schemaVerification.js
- Complete dual-write cutover: switch concierge repository reads from localStorage to server/conciergePersistence API
- Migrate Document Center, Safety Center, Support admin, Academy, and Quality engines to Postgres tables
- Consolidate audit_logs / platform_audit_log / moderation_audit_log into canonical storage
- Add RLS policies when enabling direct Supabase client reads for concierge data
- Run quarterly pg_dump restore drill per docs/runbooks/database-backup.md


## Commands

```bash
npm run build
npm run test:server-import
npm run audit:persistence
```
