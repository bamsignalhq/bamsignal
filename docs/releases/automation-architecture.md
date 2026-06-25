# Release Automation Architecture

**Status:** Architecture and preparation only — **no CI implementation in this document.**

This document defines how BamSignal will eventually automate release artifact generation. Manual process today uses [templates/](./templates/) and [checklists/](./checklists/). Automation must not break existing deploy flow (Coolify webhook on `main` push).

---

## Goals

Every production deploy should automatically produce:

1. Versioned release record (markdown)
2. Changelog from commits
3. Rollback package metadata
4. Metrics snapshot stub
5. Updated [history/index.md](./history/index.md)
6. Archived previous release record (when applicable)

---

## Design principles

| Principle | Implementation |
|-----------|----------------|
| Reproducible | Pin git SHA, Docker build ID, schema migration list |
| Auditable | Artifacts committed or stored in release archive |
| Non-blocking | Automation failures must not block deploy |
| Compatible | Session bundles and manual records remain valid |
| Secrets-safe | Never embed runtime secrets in generated artifacts |

---

## System context

```text
┌─────────────┐     push main      ┌──────────────┐
│   GitHub    │ ─────────────────► │   Coolify    │
│  bamsignal  │                    │ Docker build │
└─────────────┘                    └──────┬───────┘
       │                                  │
       │ webhook / workflow               │ deploy
       ▼                                  ▼
┌─────────────────────────────────────────────────┐
│           Release Automation (future)            │
│  collect metadata → generate docs → index update │
└─────────────────────────────────────────────────┘
       │
       ▼
 docs/releases/history|archive|metrics|rollback
```

---

## Trigger points (future)

| Trigger | Action |
|---------|--------|
| Git tag `v*.*.*` pushed | Full release record generation |
| Merge to `main` | RC or continuous changelog append |
| Coolify deploy success webhook | Post-deploy verification stub + metrics T+0 |
| Coolify deploy failure | Incident stub + rollback reminder |
| Manual `npm run release:prepare` | Local pre-deploy bundle (optional script) |

---

## Metadata sources

| Field | Source |
|-------|--------|
| Git commit | `git rev-parse HEAD` |
| Git branch | `git rev-parse --abbrev-ref HEAD` |
| Build timestamp | CI runner ISO-8601 UTC |
| Docker image | Coolify deployment API / commit SHA |
| Web version | `package.json` version + Vite manifest hash |
| Android version | Parse `android/app/build.gradle` |
| Database schema | Latest filename in `migrations/*.sql` sorted |
| Supabase project | Env `SUPABASE_URL` host (redacted in public docs) |
| API version | `/ready` schema payload version field (when exposed) |

---

## Planned automation modules

### 1. Generate release notes

**Input:** Commit range (`previous-tag..HEAD`), PR labels  
**Output:** Populated sections in `release-template.md`:

- Features / Bug Fixes (from conventional commits or PR titles)
- Appendix commits list
- Pull requests list (GitHub API)

**Script location (future):** `scripts/release/generate-release-notes.mjs`

### 2. Generate metrics

**Input:** Coolify metrics, Supabase dashboard API, application logs (read-only)  
**Output:** `docs/releases/metrics/YYYY-MM-DD-vX.Y.Z-metrics.md` from [metrics-template.md](./templates/metrics-template.md)

**Schedule:** T+0 at deploy; cron for T+24h, T+48h, T+7d reminders

**Script location (future):** `scripts/release/capture-metrics.mjs`

### 3. Collect commits

**Input:** `git log --pretty=format:` with merge strategy  
**Output:** Appendix section + changelog fragment

**Script location (future):** `scripts/release/collect-commits.mjs`

### 4. Attach Docker tag

**Input:** Coolify deployment webhook payload or `git rev-parse HEAD`  
**Output:** Release Information `Docker Image` field

**Note:** In-repo rollback = git SHA redeploy, not separate registry tag ([deployment-recovery.md](../runbooks/deployment-recovery.md)).

### 5. Attach schema version

**Input:** `migrations/` directory listing + optional `/ready?details=1`  
**Output:** `Database Schema Version` field

**Script location (future):** `scripts/release/schema-version.mjs`

### 6. Attach build timestamp

**Input:** CI `BUILD_TIMESTAMP` env or `date -u +%Y-%m-%dT%H:%M:%SZ`  
**Output:** Release Information table

### 7. Generate changelog

**Input:** Conventional commits between tags  
**Output:** `CHANGELOG.md` (root) or `docs/releases/history/changelog.md`

**Format:**

```markdown
## [1.0.15] - 2026-06-26
### Fixed
- ...
```

### 8. Generate rollback package

**Input:** Previous release record from history index  
**Output:** Pre-filled [rollback-template.md](./templates/rollback-template.md) in `docs/releases/rollback/` with:

- Previous stable commit SHA
- Previous Coolify deployment reference
- Smoke test command block

**Script location (future):** `scripts/release/generate-rollback-package.mjs`

### 9. Generate release archive

**Input:** Completed release record + metrics + incident logs  
**Output:** Copy set to `docs/releases/archive/YYYY-MM-DD-vX.Y.Z/` including:

- `release.md`
- `metrics.md`
- `incidents/` (if any)
- `rollback.md` (if any)

**Script location (future):** `scripts/release/archive-release.mjs`

---

## Proposed npm scripts (future)

```json
{
  "release:prepare": "node scripts/release/prepare-release.mjs",
  "release:notes": "node scripts/release/generate-release-notes.mjs",
  "release:metrics": "node scripts/release/capture-metrics.mjs",
  "release:rollback-package": "node scripts/release/generate-rollback-package.mjs",
  "release:archive": "node scripts/release/archive-release.mjs",
  "release:update-index": "node scripts/release/update-history-index.mjs"
}
```

**Not implemented.** Add only when scripts exist and tests cover them.

---

## CI integration outline (future)

### GitHub Actions (example — not created)

| Job | When | Steps |
|-----|------|-------|
| `release-validate` | PR to `main` | `npm run build`, `test:server-import`, `test:source-integrity` |
| `release-draft` | Tag push | Generate release notes, open PR to commit docs |
| `release-post-deploy` | Coolify webhook | Metrics T+0, update index status → Released |

### Coolify webhook (example — not configured)

```json
{
  "event": "deploy.success",
  "commit_sha": "...",
  "service": "bamsignal-production"
}
```

Handler validates `/ready`, files metrics stub, notifies release engineer.

---

## Index maintenance automation

**File:** [history/index.md](./history/index.md)

**Future behavior:**

1. Parse front matter or table from new release markdown
2. Insert row sorted by date descending
3. Validate commit SHA exists on `main`
4. Fail CI if index not updated when `docs/releases/history/*.md` added

---

## Compatibility with existing docs

| Existing | Relationship |
|----------|--------------|
| [Session bundles](../evaluation/) | Historical; link from index **Legacy artifacts** |
| [Runbooks](../runbooks/) | Operational; rollback template links to deployment-recovery |
| [.cursor/rules/deployment.mdc](../../.cursor/rules/deployment.mdc) | Source of truth for env and deploy commands |
| Manual release records | Always valid; automation prepends/generated sections only |

---

## Security constraints

- Generated docs must never include secret values
- `/ready?details=1` output sanitized before commit
- GitHub tokens scoped read-only for PR/commit APIs
- Coolify API tokens stored in CI secrets only

---

## Implementation phases

| Phase | Scope | Exit criteria |
|-------|-------|---------------|
| **0 (complete)** | Templates, checklists, history index, this document | Manual releases follow framework |
| **1** | `collect-commits`, `schema-version`, `update-history-index` scripts | One command fills release template appendix |
| **2** | `generate-release-notes`, changelog on tag | Tag push produces CHANGELOG draft |
| **3** | Coolify webhook + metrics T+0 | Post-deploy metrics stub filed automatically |
| **4** | Rollback package + archive | One-click rollback doc from previous release |

---

## Acceptance mapping

| Requirement | Deliverable |
|-------------|-------------|
| Permanent framework | [README.md](./README.md) + directory structure |
| Standard template | [release-template.md](./templates/release-template.md) |
| Rollback documented | [rollback-template.md](./templates/rollback-template.md) + checklist |
| Incident documented | [incident-template.md](./templates/incident-template.md) |
| Metrics documented | [metrics-template.md](./templates/metrics-template.md) |
| Production checklist | [production-release-checklist.md](./checklists/production-release-checklist.md) |
| Deep links | [deep-link-verification.md](./checklists/deep-link-verification.md) |
| History index | [history/index.md](./history/index.md) |
| Future automation | This document |
| Existing docs compatible | Legacy artifacts section in index |

---

## Related

- [Release Management System](./README.md)
- [Production release checklist](./checklists/production-release-checklist.md)
- [Deployment recovery](../runbooks/deployment-recovery.md)
