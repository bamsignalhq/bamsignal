# Certification Profiles

BamSignal certification runs in one of three **profiles**. Set `CERTIFICATION_PROFILE` or use the npm script suffix.

| Profile | Command | Blocks production? | Purpose |
|---------|---------|-------------------|---------|
| **LOCAL** | `npm run certify:rc:local` | No — advisory | Developer laptop; missing infra → **SKIPPED**, not **FAILED** |
| **STAGING** | `npm run certify:rc:staging` | Yes (staging gate) | Full integration tests with staging secrets on stable hardware |
| **PRODUCTION** | `npm run certify:rc:production` | Yes (official RC) | Read-only production verification + delegated staging integration reports |

## Environment variables

| Variable | Values | Default |
|----------|--------|---------|
| `CERTIFICATION_PROFILE` | `local`, `staging`, `production` | Auto-detect from `DATABASE_URL`, `ENV_TARGET`, `PUBLIC_APP_URL` |
| `CERTIFICATION_EXECUTION_MODE` | `dry-run`, `staging`, `production` | Derived from profile |
| `CERTIFICATION_PLAYWRIGHT_READY` | `true` / `false` | Auto-detect Chromium cache |
| `DOCKER_IMAGE` / `COOLIFY_IMAGE` | Image ref | Included in release manifest when set |

## Skip vs fail

Infrastructure unavailable on **LOCAL**:

- Missing Playwright → performance cert **SKIPPED**
- Missing staging secrets → drift cert **SKIPPED**
- Process exit code **0** (advisory)

Same missing infrastructure on **STAGING** or **PRODUCTION**:

- Status **SKIPPED** with reason
- RC gate **blocks** if subsystem is required
- Process exit code **1**

## Auto-detection

`shared/certificationProfile.mjs` detects:

- Playwright Chromium installation
- Database URL (`DATABASE_URL`)
- Provider credentials (Paystack, Sendchamp, Resend, Supabase, cron, command center)

## Reports

Each profile writes:

- RC report: `certification/release-candidate/reports/latest.json`
- Manifest: `certification/manifest/latest-{profile}.json`
- Canonical manifest: `certification/manifest/latest.json`

**LOCAL** reports are advisory. **PRODUCTION** manifest is the official release artifact.
