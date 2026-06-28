# Release Pipeline

## Overview

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ LOCAL       │     │ STAGING (CI/runner)  │     │ PRODUCTION (RC)     │
│ advisory    │ ──► │ full integration     │ ──► │ smoke + official RC │
└─────────────┘     └──────────────────────┘     └─────────────────────┘
```

Local developer runs do **not** block production. The canonical gate runs in CI or a dedicated release runner.

## Commands

| Step | Command |
|------|---------|
| Local advisory RC | `npm run certify:rc:local` |
| Staging integration pipeline | `npm run certify:pipeline:staging` |
| Staging RC only | `npm run certify:rc:staging` |
| Production smoke | `npm run smoke:production` |
| Official production RC | `npm run certify:rc:production` |

## RC GO criteria (production profile)

**Required directly:**

- Production smoke (`smoke:production`) — 100% read-only checks against bamsignal.com
- Security certification

**Required via fresh staging delegation (≤ 7 days):**

- Reliability
- Performance
- Platform load
- Data integrity
- Database
- Operational drift
- Penetration
- Chaos

If staging integration reports are missing or stale, production RC **NO GO** until staging pipeline re-runs.

## CI integration

GitHub Actions: `.github/workflows/release-candidate.yml`

- **Push to `main`:** staging pipeline (build, test, Playwright install, integration certs, staging RC)
- **Manual `production` dispatch:** production smoke + official RC

### Required CI secrets

- `DATABASE_URL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`, `VITE_PAYSTACK_PUBLIC_KEY`
- `SENDCHAMP_API_KEY`, `RESEND_API_KEY`
- `CRON_SECRET`, `COMMAND_CENTER_PIN`

### Coolify alternative

Run on release runner:

```bash
export CERTIFICATION_PROFILE=staging
npx playwright install chromium
npm run certify:pipeline:staging
```

After deploy to production:

```bash
export CERTIFICATION_PROFILE=production
npm run smoke:production
npm run certify:rc:production
```

Upload `certification/manifest/latest-production.json` as the release artifact.

## Artifacts

| Artifact | Profile | Blocks deploy? |
|----------|---------|----------------|
| `certification/manifest/latest-local.json` | LOCAL | No |
| `certification/manifest/latest-staging.json` | STAGING | Yes (staging promotions) |
| `certification/manifest/latest-production.json` | PRODUCTION | Yes (production) |

## Implementation modules

- `shared/certificationProfile.mjs` — profile + prerequisite detection
- `shared/certificationRunner.mjs` — SKIPPED vs FAILED exit semantics
- `shared/releaseCandidateGate.mjs` — profile-aware RC gate rules
- `shared/certificationManifest.mjs` — canonical manifest builder
- `scripts/run-staging-release-pipeline.mjs` — staging pipeline orchestrator
