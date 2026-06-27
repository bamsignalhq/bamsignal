# Performance Certification™

**Run:** perf-mqvm2hoo
**Target:** http://127.0.0.1:3099
**Score:** 100%
**Result:** PASS
**Trend:** regressing

## Metrics

| Metric | Value | Status | Threshold |
|--------|-------|--------|-----------|
| Warm startup | 107ms | PASS | ≤ 300ms |
| Cold startup | 143ms | PASS | ≤ 1200ms |
| LCP | 352ms | PASS | ≤ 1800ms |
| CLS | 0 | PASS | ≤ 0.1 |
| FID | 0ms | PASS | ≤ 100ms |
| TTFB | 14ms | PASS | ≤ 300ms |
| API latency (P95) | 13ms | PASS | P95 ≤ 250ms |
| Slowest endpoint | 13ms | PASS | ≤ 250ms |
| Bundle size | 5026KB | PASS | growth ≤ 10% |
| Memory | 10MB | PASS | leak ≤ 15% |
| CPU proxy | 0ms | PASS | informational |
| Database response | 4ms | PASS | ≤ 150ms |
| Largest image | 0KB | PASS | informational |
| Largest JS chunk | 1321KB | PASS | informational |
