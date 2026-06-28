# Release Manifest Specification

Schema version: **1.0.0**

The release manifest is the canonical machine-readable certification artifact written by `npm run certify:rc`.

## Location

| File | Purpose |
|------|---------|
| `certification/manifest/latest.json` | Most recent manifest (any profile) |
| `certification/manifest/latest-local.json` | Latest LOCAL advisory run |
| `certification/manifest/latest-staging.json` | Latest STAGING integration run (used for production delegation) |
| `certification/manifest/latest-production.json` | Official production RC manifest |
| `certification/manifest/release-manifest-{runId}.json` | Stamped historical copy |

## Top-level fields

```json
{
  "schemaVersion": "1.0.0",
  "manifestType": "PRODUCTION | STAGING | LOCAL",
  "certificationProfile": "production | staging | local",
  "executionMode": "dry-run | staging | production",
  "generatedAt": "ISO-8601",
  "gitCommit": "full sha",
  "gitCommitShort": "12-char prefix",
  "buildVersion": "1.0.15",
  "buildCode": "18",
  "cacheVersion": "bamsignal-v1.0.15-18-…",
  "buildTime": "ISO-8601 | null",
  "dockerImage": "registry/image:tag | null",
  "environment": "ENV_TARGET value",
  "prerequisites": {
    "playwright": { "ready": true, "reason": null },
    "database": true,
    "missingSecrets": {}
  },
  "rcRunId": "rc-…",
  "rcNumber": "RC1-…",
  "releaseDecision": "go | go-with-conditions | no-go",
  "releaseDecisionLabel": "GO | LOCAL ADVISORY | NO GO",
  "overallScore": 92,
  "passed": true,
  "advisoryOnly": false,
  "requiredSubsystems": ["production-smoke", "security"],
  "delegatedStagingSubsystems": ["reliability", "performance", "…"],
  "subsystems": [],
  "summary": { "passed": 20, "failed": 0, "skipped": 3, "total": 26 },
  "skippedTests": [{ "id": "performance", "reason": "…", "detail": "…" }],
  "failureReasons": [{ "subsystemId": "…", "reason": "…" }],
  "blockers": []
}
```

## Subsystem entry

```json
{
  "id": "reliability",
  "label": "Reliability",
  "certify": "certify:reliability",
  "outcome": "passed | failed | skipped",
  "passed": true,
  "required": true,
  "blocksRelease": false,
  "skipped": false,
  "skipReason": null,
  "skipDetail": null,
  "score": 100,
  "generatedAt": "ISO-8601",
  "delegatedFrom": "staging | null",
  "summary": "…",
  "failureReasons": []
}
```

## Consumption

- **Coolify / CI:** Upload `latest-staging.json` after staging pipeline; gate production deploy on `latest-production.json` with `passed: true`.
- **Admin RC dashboard:** Reads `certification/release-candidate/reports/latest.json` (human report); manifest is the structured source of truth for automation.

## Builder

`shared/certificationManifest.mjs` — `buildReleaseManifest()` + `writeReleaseManifest()`.
