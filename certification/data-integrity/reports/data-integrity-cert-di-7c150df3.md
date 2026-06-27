# Data Integrity Certification™

**Run ID:** di-7c150df3  
**Generated:** 2026-06-27T11:11:28.629Z  
**Mode:** static  
**Integrity score:** 100%  
**Release gate:** PASS

## Summary

| Metric | Value |
|--------|------:|
| Objects scanned | 18 |
| Objects repaired | 0 |
| Requiring review | 2 |
| Critical issues | 0 |
| Warnings | 1 |

## Domains

| Domain | Scanned | Repaired | Critical | Warnings | Status |
|--------|--------:|---------:|---------:|---------:|--------|
| Schema | 18 | 0 | 0 | 1 | PASS |

## Critical issues

- None

## Warnings

- **Live database scan skipped** (Schema): DATABASE_URL not connected — run against production/staging for full certification.

## Safe repairs applied

- None

## Flagged for manual review

- full-db-scan: Connect DATABASE_URL for live orphan/FK scans.

---
Command: `npm run certify:data-integrity`
