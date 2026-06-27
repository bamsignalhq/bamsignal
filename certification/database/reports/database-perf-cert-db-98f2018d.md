# Database Performance Certification™

**Run ID:** db-98f2018d  
**Generated:** 2026-06-26T22:59:53.808Z  
**Mode:** static  
**Risk score:** 89%  
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

- **Live database scan skipped** (Schema): DATABASE_URL not connected — run against production/staging for full certification.

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
- [medium] Live database scan skipped: DATABASE_URL not connected — run against production/staging for full certification.

---
Command: `npm run certify:database`
