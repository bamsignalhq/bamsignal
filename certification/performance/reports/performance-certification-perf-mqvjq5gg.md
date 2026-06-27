# Performance Certification™

**Run:** perf-mqvjq5gg
**Target:** https://bamsignal.com
**Score:** 57%
**Result:** FAIL
**Trend:** stable

## Metrics

| Metric | Value | Status | Threshold |
|--------|-------|--------|-----------|
| Warm startup | 369ms | PASS | ≤ 2000ms |
| Cold startup | 2498ms | FAIL | ≤ 2000ms |
| LCP | 2672ms | FAIL | ≤ 2500ms |
| CLS | 0 | PASS | ≤ 0.1 |
| FID | 0ms | PASS | ≤ 100ms |
| TTFB | 924ms | FAIL | ≤ 800ms |
| API latency (P95) | 1387ms | FAIL | P95 ≤ 500ms |
| Slowest endpoint | 1387ms | FAIL | ≤ 500ms |
| Bundle size | 5025KB | PASS | baseline |
| Memory | 10MB | PASS | leak ≤ 15% |
| CPU proxy | 0ms | PASS | informational |
| Database response | 524ms | FAIL | ≤ 500ms |
| Largest image | 0KB | PASS | informational |
| Largest JS chunk | 1321KB | PASS | informational |

## Recommendations

- **Fix failing metrics** — Cold startup failed; LCP failed; TTFB failed; API latency (P95) failed; Slowest endpoint failed; Database response failed
