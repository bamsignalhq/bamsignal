# Post-Merge Deployment Certification

**PR:** [#2](https://github.com/bamsignalhq/bamsignal/pull/2)  
**Merge commit:** `46b37214e978f1d5b99e5752b6117d953dcf8604`  
**Governance tip (included):** `a105928` (CI build-before-smoke fix) + `5ae578d` (platform governance)  
**Certified at:** 2026-07-21T20:21:00Z  
**Environment:** production (`https://bamsignal.com`)  
**Supabase ref:** `nswiwxmavuqpuzlsascs`

---

## Final platform status

| Gate | Status |
|------|--------|
| Platform Governance | **ACTIVE** |
| Recovery Baseline (July 2026) | **ACTIVE** |
| Migration `0055` | **Applied** |
| Legacy Auth trigger | **Removed** |
| Application health | **PASS** |
| Next migration | **0056** |

**Verdict: CERTIFIED**

---

## Deployment version

| Field | Value |
|-------|--------|
| Git merge SHA | `46b37214e978f1d5b99e5752b6117d953dcf8604` |
| Deploy path | Coolify app `wn3vlu5j7zwp5danjqfcvr2z` (auto-deploy after merge to `main`) |
| Observed restart | `/ready` reported fresh uptime (~94s → ~130s) at ~2026-07-21T20:19Z |
| Runtime `/ready` | `ready=true`, `database=connected`, `platform=coolify`, `environment=production` |
| Runtime commit metadata | `commit=null`, `version=0.0.0` (env inject gap — see observations) |

---

## CI

| Check | Result |
|-------|--------|
| Platform Governance CI on PR (after smoke order fix) | **PASS** — run `29864691880` |
| Platform Governance CI on `main` merge | **PASS** — run `29865001057` |
| Release Candidate Certification on `main` | **FAIL** (pre-existing on prior `main` pushes; not part of governance merge gate) |

Pre-merge blocker fixed and merged: governance workflow ran `test:server-import` before `build`, so clean runners lacked `dist/index.html`. Reordered to match Dockerfile: build → smoke (`a105928`).

---

## Migration applied

| ID | Applied at (UTC) |
|----|------------------|
| `0055_retire_stankings_auth_trigger` | **2026-07-21 20:18:12.938777+00** |
| Prior tip | `0054_discover_conversation_unlock` (2026-07-20) |

Evidence: live `public.schema_migrations`. No migration failure observed for `0055`.

SQL effect (as shipped):

```sql
DROP TRIGGER IF EXISTS stankings_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.stankings_handle_new_user();
```

---

## Verification results

### Auth trigger / function retirement

| Object | Pre-merge | Post-deploy |
|--------|-----------|-------------|
| Trigger `stankings_on_auth_user_created` on `auth.users` | Present | **Absent** |
| Function `public.stankings_handle_new_user()` | Present | **Absent** |

### Application health

| Check | Result | Evidence |
|-------|--------|----------|
| Build health (CI) | PASS | Governance CI green on merge |
| `GET /health` | PASS | HTTP 200 `{ok, service:bamsignal, alive}` |
| `GET /ready` | PASS | HTTP 200 `ready=true`, `database=connected` |
| Public homepage | PASS | HTTP 200 |
| Login route shell | PASS | HTTP 200 `/login` |
| Authentication surface (`POST /api/auth/pin-login`) | PASS | HTTP 401 `Invalid username or PIN.` for unknown user (mounted + auth path live) |
| Email code / PIN reset / member data mounts | PASS | HTTP 400 validation errors (routes mounted; no 404/502) |
| Feature flags / remote config | PASS | HTTP 200 |
| User registration (full E2E create) | **Not exercised** | Avoided creating production accounts in this certification |
| Existing user login (known credentials) | **Not exercised** | No production credentials used |
| Coolify runtime log UI | **Not accessible** | Cloudflare Access login required in automation browsers |

---

## Regressions observed

1. **Deploy metadata incomplete:** `/ready` reports `commit=null` and `version=0.0.0`. Non-blocking for availability; Coolify should inject `GIT_COMMIT_SHA` / `COOLIFY_SOURCE_COMMIT` and `APP_VERSION` (or `npm_package_version`) for ops traceability.
2. **Release Candidate Certification** workflow continues to fail on `main` (also failed on earlier merges). Separate from Platform Governance CI; does not block this certification.
3. **Stankings table cluster** (`stankings_*`) remains in the database by design — only the Auth trigger/function were retired in `0055`. Table cleanup is out of scope.

No migration failures and no production readiness regression detected for this deploy.

---

## Success criteria checklist

- [x] Platform Governance: ACTIVE  
- [x] Recovery Baseline: ACTIVE  
- [x] Migration 0055: Applied  
- [x] Legacy Auth trigger: Removed  
- [x] Application health: PASS  
- [x] Next migration: 0056  

---

## Follow-ups (non-blocking)

1. Inject Coolify commit/version env so `/ready` exposes deploy SHA.  
2. Optional manual smoke: one known test member PIN login + signup in a controlled window.  
3. Close Platform Recovery project; treat future schema work as ordinary `0056+` migrations.  
4. Triage or retire the failing Release Candidate Certification workflow separately.
