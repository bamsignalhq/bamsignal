# Journey Integrity Audit™

Generated: 2026-06-23T00:18:31.794Z

## Executive Summary

Journey ID backbone verification from application through legacy archive across canonical member registry and cross-system seed references.

**Canonical journeys:** 6  
**Referenced journey IDs:** 13  
**Duplicate member IDs:** 0  
**Members missing journey ID:** 0  
**Orphan references:** 7  
**Invalid format IDs:** 0  
**Finance records missing journeyRef:** 4  
**Timeline/archive issues:** 0  
**Automated check failures:** 0

Live audit: `/hard/audit/journeys` (Journey Integrity Audit™ admin view).

## Journey Integrity Report

### Canonical member registry

| Member ID | Journey ID | Format |
| --- | --- | --- |
| sc_member_amaka | BS-JR-2026-0001 | Valid |
| sc_member_tunde | BS-JR-2026-0002 | Valid |
| sc_member_zara | BS-JR-2026-0003 | Valid |
| sc_member_chidi | BS-JR-2026-0004 | Valid |
| sc_member_ife | BS-JR-2026-0005 | Valid |
| sc_member_adaeze | BS-JR-2028-0045 | Valid |


### Lifecycle stage coverage (seed data signals)

| Stage | Records with signal |
| --- | --- |
| application | 6 |
| consultation | 5 |
| assignment | 9 |
| introduction | 6 |
| follow-up | 6 |
| relationship | 6 |
| archive | 1 |
| legacy | 0 |
| success-story | 0 |
| milestones | 0 |
| family | 0 |
| quotes | 0 |
| events | 0 |


### Journey ID generation & persistence

| Check | Result |
| --- | --- |
| Format `BS-JR-YYYY-NNNN` | Pass |
| Registry sequential assignment | Pass |
| Member ID persistence | Pass — same member retains journey ID |
| Duplicate registration guard | Pass — registry rejects reused IDs |
| Client registry | `conciergeJourneyRegistry.ts` mirrors server |
| Server registry | `server/services/journeyRegistry.js` |

## Duplicate IDs

No duplicate journey IDs in canonical member registry.


## Missing References

No missing legacy references on archived/married canonical members.


### Finance journeyRef gaps

- 4 finance operation record(s) with journeyRef: null


## Broken Relationships

No timeline or archive inconsistencies detected in canonical member seed.


## Orphan Journey References

References in cross-system seeds not present in canonical member registry (demo/finance data may intentionally reference external journeys):

| Journey ID | Sources |
| --- | --- |
| BS-JR-2026-0042 | auditCenterSeed, financeOperationsSeed, consultantQualitySeed, institutionalAuditSeed |
| BS-JR-2026-0038 | auditCenterSeed, financeOperationsSeed, consultantQualitySeed, institutionalAuditSeed |
| BS-JR-2025-0031 | auditCenterSeed |
| BS-JR-2026-0035 | financeOperationsSeed, consultantQualitySeed |
| BS-JR-2026-0045 | financeOperationsSeed, consultantQualitySeed |
| BS-JR-2026-0040 | financeOperationsSeed, consultantQualitySeed |
| BS-JR-2026-0031 | institutionalAuditSeed |


## Invalid Journey ID Format

None


## Cross-System Reference Map

| Journey ID | Registry | Sources |
| --- | --- | --- |
| BS-JR-2025-0031 | External | auditCenterSeed |
| BS-JR-2026-0001 | Canonical | conciergeConsultantSeed |
| BS-JR-2026-0002 | Canonical | conciergeConsultantSeed |
| BS-JR-2026-0003 | Canonical | conciergeConsultantSeed |
| BS-JR-2026-0004 | Canonical | conciergeConsultantSeed |
| BS-JR-2026-0005 | Canonical | conciergeConsultantSeed |
| BS-JR-2026-0031 | External | institutionalAuditSeed |
| BS-JR-2026-0035 | External | financeOperationsSeed, consultantQualitySeed |
| BS-JR-2026-0038 | External | auditCenterSeed, financeOperationsSeed, consultantQualitySeed, institutionalAuditSeed |
| BS-JR-2026-0040 | External | financeOperationsSeed, consultantQualitySeed |
| BS-JR-2026-0042 | External | auditCenterSeed, financeOperationsSeed, consultantQualitySeed, institutionalAuditSeed |
| BS-JR-2026-0045 | External | financeOperationsSeed, consultantQualitySeed |
| BS-JR-2028-0045 | Canonical | conciergeConsultantSeed |


## Recommendations

- Link finance, audit, and quality seed records to canonical member journey IDs or document as external references.
- Attach journeyRef to 4 finance operation record(s) with null refs.


## Commands

```bash
npm run build
npm run test:server-import
npm run audit:journeys
```
