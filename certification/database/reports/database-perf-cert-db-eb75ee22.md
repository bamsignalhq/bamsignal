# Database Performance Certification™

**Run ID:** db-eb75ee22  
**Generated:** 2026-06-26T23:36:32.426Z  
**Mode:** static  
**Risk score:** 100%  
**Release gate:** PASS

## Query latency

| Metric | Value |
|--------|------:|
| Average query | 0ms |
| P95 | 0ms |
| P99 | 0ms |
| Slow queries | 0 |
| Cache hit | 0% |
| Pool used | 0% |
| Database size | 0 B |

## Areas

| Area | Scanned | Critical | Warnings | Status |
|------|--------:|---------:|---------:|--------|
| Schema | 3 | 0 | 1 | PASS |

## Critical query regressions

- None

## Critical issues

- None

## Warnings

- **Live database scan skipped** (Schema): Dry Run — DATABASE_URL not connected. Use .env.staging + .env.local for full database certification.

## Largest tables

| Table | Size | Rows | Seq scans | Idx scans |
|-------|-----:|-----:|----------:|----------:|
| — | — | — | — | — |

## Largest indexes

| Index | Table | Size | Scans |
|-------|-------|-----:|------:|
| — | — | — | — |

## Most expensive endpoints

| Method | Path | Avg | P95 | P99 |
|--------|------|----:|----:|----:|
| — | — | — | — | — |

## Optimization opportunities

- **Improve buffer cache hit rate** (high): Cache hit is 0% — review hot tables and memory settings.

## Recommendations

- [high] Improve buffer cache hit rate: Cache hit is 0% — review hot tables and memory settings.
- [medium] Live database scan skipped: Dry Run — DATABASE_URL not connected. Use .env.staging + .env.local for full database certification.

---
Command: `npm run certify:database`
