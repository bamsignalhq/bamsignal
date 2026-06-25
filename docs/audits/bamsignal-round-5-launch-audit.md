# Executive Summary

BamSignal is materially closer to launch after Fixes 1-27, and the core verification suite is passing. The remaining launch risks are concentrated in privacy exposure, payment idempotency/race handling, production dependency proof, and operational hardening. No P0 issue was found in this round, but multiple P1 issues are significant enough that the production verdict is not ready.

Launch Readiness Score: 76/100

Production Verdict: Not ready

Primary reason: No P0s were found, but several P1 security/privacy and payment reliability risks remain.

Verification passed:

- `npm run test:source-integrity`
- `npm run test:server-import`
- `npm run test:docker-integrity-stages`
- `npx tsc --noEmit`
- `npm run test:fortress`

Top Remaining Risks:

- P1 public username-to-email exposure.
- P1 payment fulfillment race across verify/webhook paths.
- P1 raw backend error messages returned to clients.
- P1 signup partial provisioning can orphan auth users.
- P1 production readiness was not proven from the current local environment.

No feature suggestions, redesign ideas, or product ideas are included. This audit is limited to stability, security, reliability, maintainability, operations, and launch readiness.

## Launch Readiness Score

76/100

## Production Verdict

Not ready

## Top Remaining Risks

### 1. Public Username-to-Email Exposure

Severity: P1

Files involved:

- `api/member/data.js`
- `src/services/authEmail.ts`

Root cause:

The legacy public `resolve-login` / `resolve-username` path still returns the email address associated with a username. The current username + PIN login flow no longer needs the browser to resolve the member email before login, so this endpoint is now an unnecessary identity exposure surface.

User impact:

An attacker can enumerate valid usernames and recover associated account emails, creating privacy and phishing risk.

Operational impact:

This is a privacy incident risk and increases support/legal exposure around identifier minimization.

Exact Cursor task recommendation:

Remove or lock down the public email-returning resolver, delete the unused client helper, keep username + PIN login entirely server-side, and add a regression test proving usernames cannot reveal emails.

### 2. Payment Fulfillment Race

Severity: P1

Files involved:

- `server/services/paymentFortress.js`
- `server/services/paymentFulfillments.js`
- `server/cityHome.js`

Root cause:

Payment fulfillment claims the reference and later checks whether it is fulfilled, but the activation path is not protected by an atomic row lock or processing state. City boost and spotlight placement activation also checks `paystack_reference` before insert without a unique paid-placement index, so concurrent webhook and verify requests can both create active placement rows.

User impact:

A single paid reference can grant duplicate boosts or spotlights, creating confusing ranking/visibility behavior.

Operational impact:

Duplicate entitlements create reconciliation problems, refund/support tickets, and payment ledger ambiguity.

Exact Cursor task recommendation:

Add an atomic fulfillment processing claim or row lock around activation, add a unique partial index for non-null `city_home_placements.paystack_reference`, and add a concurrency regression test covering simultaneous webhook plus verify fulfillment.

### 3. Raw Backend Errors Returned to Clients

Severity: P1

Files involved:

- `api/auth/pin-login.js`
- `api/member/data.js`
- `api/member/photos.js`

Root cause:

Several catch blocks still return `error.message` directly in JSON responses. This can expose SQL errors, Supabase storage/provider details, or implementation internals during failure paths.

User impact:

Members or attackers may see internal details that should remain server-side.

Operational impact:

Raw error disclosure increases security review burden and makes incident containment harder.

Exact Cursor task recommendation:

Replace raw client-facing error messages with generic responses plus request IDs, keep sanitized details in server logs, and add tests for PIN login, member data, and photo upload failure responses.

### 4. Signup Partial Provisioning

Severity: P1

Files involved:

- `server/services/signupOtp.js`

Root cause:

The signup completion flow creates or updates the Supabase auth user before the local app user and member profile writes complete. If the DB/profile step fails after auth creation, the account can be left partially provisioned.

User impact:

A new user may be blocked from retrying signup because their auth account exists but their BamSignal member profile does not.

Operational impact:

Partial accounts create manual repair work and noisy signup support cases.

Exact Cursor task recommendation:

Add compensating cleanup or resumable provisioning state after auth creation, make retries repair the local profile deterministically, and add tests for DB failure after Supabase auth user creation.

### 5. Production Readiness Not Proven From Current Environment

Severity: P1

Files involved:

- `server/services/readiness.js`
- `server/config.js`
- `Dockerfile`

Root cause:

Local smoke output showed missing `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, Supabase service-role-backed signup email readiness, and photo storage readiness. The code correctly fails `/ready` in that state, but this audit did not prove the production environment has all required dependencies configured.

User impact:

If production mirrors the local smoke environment, signup, payments, and photo upload will fail.

Operational impact:

Deployment may look live at the process level while readiness remains failed, blocking healthy rollout or causing outage symptoms.

Exact Cursor task recommendation:

Run production `/ready` diagnostics with secrets configured, verify database, Paystack, signup email, and photo storage are all ready, and attach sanitized evidence to the launch report.

### 6. Runtime Schema Mutation on Startup and Request Paths

Severity: P2

Files involved:

- `server/db.js`
- `server/cityHome.js`

Root cause:

The app still performs `create table`, `alter table`, and index creation from runtime startup/request helpers instead of relying fully on versioned migrations.

User impact:

Cold starts or first requests can fail or slow down if schema DDL locks or permissions fail.

Operational impact:

Runtime DDL requires elevated DB privileges, complicates rollback, and can create migration drift across environments.

Exact Cursor task recommendation:

Move runtime schema changes into Supabase migrations, convert startup to verify-only checks, and add a startup test that fails if runtime DDL helpers are called in production mode.

### 7. Rate-Limit Table Growth and Write Amplification

Severity: P2

Files involved:

- `server/services/rateLimit.js`
- `server/services/paymentInitializeThrottle.js`

Root cause:

Protected request paths insert rate-limit events into database tables, but no retention cleanup, partitioning, or compaction policy is visible in code.

User impact:

Search, discover, profile view, and payment initialization can slow down as event tables grow.

Operational impact:

Unbounded rate-limit tables increase DB storage, index bloat, backup size, and query latency.

Exact Cursor task recommendation:

Add retention cleanup or partitioning for rate-limit event tables, document the retention policy, and add a load/regression test proving old rows are removed or ignored efficiently.

### 8. Monitoring Depends on Console Logs Only

Severity: P2

Files involved:

- `server/services/observability.js`

Root cause:

Alertable events are structured and thresholded, but the implementation emits to console only. No verified alert sink, log-drain rule, or external notifier is proven in this repo.

User impact:

Payment, readiness, email, photo, and database failures may be noticed late.

Operational impact:

Silent incidents can persist until a user reports them.

Exact Cursor task recommendation:

Wire deployment log-drain alert rules or an existing notifier for alertable events, then document and test that `payment_*_failed`, `ready_check_failed`, `photo_upload_failed`, and `db_unavailable` create actionable alerts.

### 9. Legacy Setup Endpoint Accepts Secrets Outside Headers

Severity: P2

Files involved:

- `api/hard/setup.js`
- `server/services/consoleSetup.js`

Root cause:

The older setup route accepts setup secrets via query/body paths, unlike the hardened admin bootstrap route that requires explicit enablement and header-only secrets.

User impact:

No direct member-facing impact.

Operational impact:

Secrets in query strings or body fields are more likely to be captured by logs, browser history, proxies, or debugging tools.

Exact Cursor task recommendation:

Disable the legacy setup endpoint in production or require explicit enablement plus header-only secret validation, then add a bootstrap-hardening test that rejects query/body secrets.

### 10. Android HTTPS App-Link Verification Incomplete

Severity: P3

Files involved:

- `android/app/src/main/AndroidManifest.xml`
- `public/.well-known/assetlinks.json`

Root cause:

The Android manifest declares an `autoVerify` HTTPS intent for `https://bamsignal.com/payment/success`, but no `public/.well-known/assetlinks.json` file is present to prove domain ownership to Android.

User impact:

HTTPS payment-success links may open in the browser instead of the app on Android. The custom scheme callback remains available as a fallback.

Operational impact:

This can create Android payment-return support tickets and inconsistent callback behavior across devices.

Exact Cursor task recommendation:

Add a valid Digital Asset Links file for `com.bamsignal.com` and the release signing certificate fingerprint, or remove `autoVerify` and rely only on the custom scheme callback.

## Recommended Next Task

Fix P1 public identity exposure first: remove the public email-returning `resolve-login` path, keep username + PIN login entirely server-side, and add a regression test proving usernames cannot reveal emails.

## Verification Notes

The required verification commands passed during the Round 5 audit:

- `npm run test:source-integrity`
- `npm run test:server-import`
- `npm run test:docker-integrity-stages`
- `npx tsc --noEmit`

The broader launch-readiness suite also passed:

- `npm run test:fortress`

The server import and fortress suites required local port binding for smoke tests. The sandbox-level `listen EPERM` seen during initial local execution was environmental; rerunning outside that restriction passed.

## Assumptions

- This report treats BamSignal as a fresh codebase and ignores previous audit conclusions.
- Existing dirty worktree changes outside this audit report are assumed to be user or prior-agent work and were not modified.
- Production secrets were not printed or embedded in this report.
- This report is audit-only and does not implement fixes for the listed risks.
