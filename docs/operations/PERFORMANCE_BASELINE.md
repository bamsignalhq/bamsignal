# Performance Baseline

## Thresholds (Sprint 7)

| Metric | Target |
|--------|--------|
| Startup duration | < 30s |
| Migration duration | < 60s |
| API P95 | < 500ms |
| `/ready` response | < 2s |
| `/health` response | < 200ms |

Defined in `server/services/productionReadiness/performanceAudit.js`.

## Measurement Commands

```bash
npm run certify:performance
npm run certify:platform-load
npm run test:production-readiness
```

## Domain Observability Baselines

Captured at audit time via:

- `getAuthObservabilityMetrics()`
- `getFinancialObservabilityMetrics()`
- `getMessagingObservabilityMetrics()`
- `getOperationsObservabilityMetrics()`
- `getPassportIntegrationMetrics()`

## Known Optimisation Opportunities

- Monitor N+1 patterns in member bundle fetches
- Review large JSON payloads in admin dashboard contracts
- Passport sync queue batch processing under high load

## Load Test Plan

See `server/services/productionReadiness/loadTestPlan.js` for repeatable scenarios:

- Signup burst
- Discover/matching load
- Messaging throughput
- Payment initialization
- Moderation reports
- Passport synchronization

Run before launch cutover against staging environment.
