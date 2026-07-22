# Production Readiness

Sprint 7 certifies BamSignal for production deployment without adding business features.

## Audit Domains

| Domain | Module | Purpose |
|--------|--------|---------|
| Security | `securityAudit.js` | Auth, secrets, RLS, admin access |
| Performance | `performanceAudit.js` | Startup, migration, baselines |
| Resilience | `resilienceAudit.js` | Idempotency, retries, fallbacks |
| Deployment | `deploymentAudit.js` | Health, migrations, Coolify |
| Observability | `observabilityAudit.js` | Domain metrics completeness |
| Rate limiting | `rateLimitAudit.js` | Abuse protection coverage |
| Disaster recovery | `disasterRecovery.js` | Backup and restore checklist |

## Running Audits

```bash
npm run test:production-readiness
npm run certify:production-journeys
npm run generate:launch-readiness
npm run certify:production
```

## Production Journeys

Five automated journeys in `scripts/certify-production-journeys.mjs`:

1. Signup → Verify → Profile → Premium → Match → Message
2. Report → Moderation → Appeal
3. Payment → Subscription → Trust Update
4. Support Ticket → Resolution
5. Concierge Assignment → Completion

## Launch Gate

Production cutover requires:

- `npm run certify:production` PASS (all checks including readiness + journeys)
- Coolify `/ready` health check green
- Migration `0063` applied on Supabase
- No high-risk security audit findings

## Programmatic Report

```javascript
import { buildProductionReadinessReport } from "./server/services/productionReadiness/index.js";
const report = await buildProductionReadinessReport(process.env);
```
