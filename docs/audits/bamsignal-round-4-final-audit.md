# Executive Summary

Audit date: June 21, 2026

Scope: fresh production audit for security, payment integrity, entitlements, auth/session reliability, media trust, profile consistency, admin hardening, database readiness, storage reliability, webhook correctness, deployment safety, Android release safety, service worker safety, observability, backup/recovery, performance, memory leaks, race conditions, and scale readiness.

This round treats earlier audits as obsolete. No code was changed as part of this audit.

BamSignal is materially stronger than the previous risk profile. The major fortress items are mostly implemented in code and covered by targeted tests:

- Client payment amount/duration is no longer trusted for fulfillment.
- Payment confirmation fails closed when the payment database is unavailable.
- Paystack webhook paths are consolidated through one handler.
- Member photo approval is server-owned and public profile photos are approved-only.
- Member data APIs derive identity from Supabase bearer auth for protected actions.
- `/health` is liveness-only and `/ready` is dependency-aware.
- Member auth throttles fall back to memory during DB outage, while admin action PIN fails closed.
- Android release has asset parity and signing guards.
- Service worker avoids API/HTML caching and uses network-first asset recovery.
- Runbooks now exist and are covered by static tests.

The remaining blockers are narrower but still production-relevant. The largest issue is an admin bootstrap endpoint that remains mounted in the production app and can create/update an admin account with broad operational secrets. The second launch blocker is that the requested Docker integrity-stage test fails in this checkout. The payment system is much more robust, but there is still no committed evidence of a completed production payment covering callback, signed webhook, idempotent fulfillment, and entitlement activation after the latest fixes.

Launch Readiness Score: 78/100

Production Verdict: Not ready

Rationale: ready-looking for internal QA and near closed beta, but not ready to launch until the P1 security/deployment gates are cleared and one real payment/webhook entitlement path is proven end to end.

## Verification

Commands run:

| Check | Result | Notes |
| --- | --- | --- |
| `npm run test:source-integrity` | PASS | Includes payment catalog, payment persistence, webhook, photo authority, profile patch races, readiness, auth throttle outage, identity exposure, observability, runbooks, bundle performance, and stability checks. Local env intentionally lacked production secrets, so readiness correctly failed closed. |
| `npm run test:server-import` | PASS | Server starts, `/health` passes, `/ready` returns 503 without production dependencies, webhook aliases are mounted. |
| `npm run test:docker-integrity-stages` | FAIL | Fails with: `package scripts must keep source integrity and runtime smoke independent`. |
| `npx tsc --noEmit` | PASS | TypeScript completed cleanly. |

`npm run build` was not run because the request warned it may dirty generated files.

Pre-existing dirty/untracked files were present before this audit: `public/sitemap.xml`, `public/sw.js`, `src/buildInfo.ts`, `docs/audits/bamsignal-final-audit.md`, and `docs/audits/bamsignal-post-fix-audit.md`.

Final status also showed unrelated modified files `src/pages/AuthPage.tsx` and `src/styles/auth.css`; this audit did not edit them and treated them as outside scope.

## Previous Special Risks Re-check

| Risk | Current status |
| --- | --- |
| Client-controlled payment amount/duration | Resolved in code. Payment initialization and fulfillment resolve products from server catalogs and stored purchase intent. |
| Payment success while DB unavailable | Resolved in code. Payment persistence and fulfillment call `requireDatabaseReadyForPayments()` and return 503 on persistence failure. |
| Paystack webhook route drift | Resolved in code. `/api/paystack/webhook`, `/api/webhooks/paystack`, and `/webhooks/paystack` mount one shared handler. |
| Member-forged photo approval | Resolved for app surfaces. Member uploads are forced to `pending_review`, privileged statuses are preserved/stripped, and public profile photos are approved-only. |
| Profile/photo/voice last-write-wins races | Reduced, not fully eliminated. Patch scopes exist, but final DB write still replaces the whole profile JSON after read/merge. |
| `/health` falsely reporting readiness | Resolved. `/health` is liveness-only; `/ready` gates database, Paystack, signup email, and storage. |
| Throttle fail-open during DB outage | Mostly resolved. Member PIN throttles use memory fallback; admin action PIN fails closed. Memory fallback needs a cap/sweep. |
| Identity/admin/status exposure | Mostly resolved in responses. Logs still include raw emails/usernames in several auth/admin paths. |
| Large initial bundle | Partially resolved. Lazy route boundaries exist, but the performance test is static and the main app still eagerly imports several member pages. |
| Missing operations/runbooks | Resolved at documentation level. Runbooks exist and pass static coverage checks; no automated backup/restore drill evidence is committed. |

## Top Remaining Risks

### 1. Admin bootstrap endpoint remains production-mounted

Severity: P1

Files involved:

- `server/app.js`
- `api/admin/bootstrap.js`
- `server/services/adminBootstrap.js`

Root cause: `server/app.js` mounts `POST /api/admin/bootstrap` unconditionally. The handler accepts `CRON_SECRET` or `DIAGNOSTICS_SECRET` through header, query, body, or Bearer-style Authorization, then `bootstrapOpsAdmin()` can create or update a Supabase admin account and returns the generated password when one is generated.

User impact: If any broad operational secret leaks, an attacker can create or reset an admin login and access member/admin controls.

Probability: Medium. The endpoint is not exploitable without a secret, but it is public, uses shared secrets, and accepts secrets in query/body where logs and browser history can capture them.

Operational impact: High. Compromise would require admin credential rotation, secret rotation, audit review, and member trust remediation.

Exact Cursor task recommendation: Disable production bootstrap by default. Require a dedicated `ADMIN_BOOTSTRAP_SECRET` distinct from `CRON_SECRET` and `DIAGNOSTICS_SECRET`, accept it only via a header, add an explicit `ADMIN_BOOTSTRAP_ENABLED=true` gate, return no password after initial one-time bootstrap, log every attempt through redacted observability, and document the post-bootstrap disable step.

### 2. Docker integrity-stage release gate fails

Severity: P1

Files involved:

- `package.json`
- `scripts/test-docker-integrity-stages.mjs`
- `Dockerfile`
- `scripts/source-integrity-check.mjs`
- `scripts/smoke-server-import.mjs`

Root cause: `scripts/test-docker-integrity-stages.mjs` expects `package.json` to keep `test:source-integrity` as only `node scripts/source-integrity-check.mjs`, `test:server-import` as the runtime smoke, and `test:all-integrity` as the composition. Current `test:source-integrity` now aggregates many fortress tests, so the static Docker separation assertion fails.

User impact: No direct app user impact, but release validation is red and can block or desensitize production deploys.

Probability: High. The requested command fails every run in this checkout.

Operational impact: High. A failing release guard either blocks deploys or trains operators to bypass an important Docker source/runtime integrity check.

Exact Cursor task recommendation: Restore script separation. Make `test:source-integrity` the narrow source integrity check, keep `test:server-import` as runtime smoke, create a new aggregate script such as `test:fortress` or `test:production-integrity` for the larger fortress suite, update CI/docs to run the aggregate, and rerun `npm run test:docker-integrity-stages`.

### 3. Completed production payment and signed webhook entitlement activation still lack evidence

Severity: P1

Files involved:

- `PAYSTACK_PRODUCTION_VALIDATION_V3.md`
- `api/paystack/verify.js`
- `server/services/paystackWebhookHandler.js`
- `server/services/paymentFortress.js`
- `server/services/paymentFulfillments.js`

Root cause: Current code has strong payment integrity controls and V3 documentation shows Paystack initialize passed for six products. However, the latest committed evidence still states that a full signed `charge.success` flow requires a real test payment in Paystack dashboard. There is no final evidence of callback verification plus signed webhook plus entitlement row update plus idempotent duplicate handling in production after the fortress fixes.

User impact: A real payer could be charged while entitlement activation depends on an unproven callback/webhook edge case.

Probability: Medium. Code paths are sound, but payment systems fail at integration boundaries more often than unit tests suggest.

Operational impact: High. Payment support incidents are expensive: manual verification, entitlement repair, refund risk, and trust loss.

Exact Cursor task recommendation: Run one real low-value payment per product class: Signal Pass, Fast Connection, and one boost. For each, capture Paystack reference, `/payment/success` client verification result, `payment_fulfillments` row, `app_users` or placement entitlement, signed webhook response, and duplicate webhook/verify idempotency result. Commit a short redacted validation report.

### 4. Payment initialization is unauthenticated and unthrottled

Severity: P2

Files involved:

- `api/paystack/verify.js`
- `server/services/paymentFortress.js`
- `server/services/paymentFulfillments.js`
- `server/services/rateLimit.js`

Root cause: `?action=initialize`, `?action=initialize-boost`, and `?action=initialize-quickie` accept an email in the body, create a local purchase intent, and call Paystack without requiring a member bearer token or endpoint rate limit.

User impact: Attackers cannot grant themselves entitlements without a successful Paystack transaction, but they can create checkout noise for arbitrary emails and inflate local payment intent rows.

Probability: Medium. Public payment initialize endpoints are discoverable and cheap to call.

Operational impact: Medium. Paystack API noise, payment ledger clutter, support confusion, and alert fatigue during abuse.

Exact Cursor task recommendation: Add a payment initialize rate limit keyed by IP plus normalized email, and require bearer member auth when a user is signed in. For guest-compatible checkout, keep the body email requirement but cap attempts and block obvious abuse before `recordPurchaseIntent()` and `initializePaystackTransaction()`.

### 5. Payment API can surface upstream Paystack messages to users

Severity: P2

Files involved:

- `server/services/paystackClient.js`
- `api/paystack/verify.js`
- `src/services/payments.ts`

Root cause: `paystackErrorResponse()` returns `error.message` for `PaystackClientError`. For upstream failures such as invalid credentials, Paystack messages can become client-visible. Earlier payment validation already observed `Invalid key` in responses.

User impact: Users may see internal payment provider/auth wording instead of stable product copy.

Probability: Medium. Any Paystack auth or upstream error can trigger this.

Operational impact: Medium. Exposes implementation details, increases support burden, and can confuse payment recovery triage.

Exact Cursor task recommendation: Keep Paystack upstream detail in structured logs only. Return generic client messages for `initialize_failed`, `verify_failed`, `not_configured`, `timeout`, and `network_error`; include only a safe code/reference in the response.

### 6. Profile/photo/voice race hardening is scoped but not atomic

Severity: P2

Files involved:

- `api/member/data.js`
- `server/utils/profileMerge.js`
- `server/cityHome.js`
- `shared/profilePatch.mjs`
- `scripts/test-profile-patch-races.mjs`

Root cause: The server now reads the existing profile, merges only the requested patch scope, and then calls `upsertMemberProfile()` with a complete replacement `profile = excluded.profile`. If two requests read the same old row before either writes, the later full JSON replacement can still overwrite newer scope changes from the first write.

User impact: Rare lost updates in fast profile/photo/voice editing sessions, such as a just-uploaded photo, cover, or voice URL disappearing after a near-simultaneous profile save.

Probability: Low to Medium. Normal UI revalidates after saves, but mobile/network retries and parallel uploads can overlap.

Operational impact: Medium. Support tickets for lost media/profile edits and hard-to-reproduce race bugs.

Exact Cursor task recommendation: Make scoped profile writes atomic at the database layer. For `profile`, `photos`, and `voice` scopes, update only the affected JSON keys with `jsonb_set`/merge SQL or use an optimistic `updated_at`/version compare and retry on conflict. Add a test that simulates two stale reads followed by reversed writes.

### 7. In-memory auth/OTP stores have no size cap or background cleanup

Severity: P2

Files involved:

- `server/services/memoryThrottle.js`
- `server/services/signupOtp.js`
- `server/services/pinReset.js`

Root cause: The DB-outage member throttle fallback stores attempts in a process-level `Map` with no max size or periodic sweep. Signup OTP and PIN reset also retain process memory entries alongside DB rows and only clear entries on read/verify/success.

User impact: During abuse or DB degradation, login/signup/reset reliability can degrade as memory grows.

Probability: Medium during outages or credential-stuffing/email-code abuse; low during normal traffic.

Operational impact: Medium. A long-running container can accumulate memory and require restart under attack or high churn.

Exact Cursor task recommendation: Add bounded TTL caches with max entries and sweep-on-write/scheduled cleanup for member throttle, signup OTP, and PIN reset memory stores. Add tests that expired entries are removed and store size cannot exceed the configured cap.

### 8. Backup and recovery are documented, but not evidenced as operational

Severity: P2

Files involved:

- `docs/runbooks/README.md`
- `docs/runbooks/database-backup.md`
- `docs/runbooks/database-restore.md`
- `docs/runbooks/storage-backup.md`
- `docs/runbooks/storage-restore.md`
- `scripts/test-runbooks.mjs`

Root cause: Runbooks exist and pass static checks, but the README explicitly states no automated backup jobs ship in the repository. There is no committed evidence of an actual backup schedule, off-site storage, or staging restore drill.

User impact: In a data-loss incident, recovery depends on operator discipline and external platform configuration rather than proven automation.

Probability: Medium over the service lifetime.

Operational impact: High. Data recovery uncertainty affects member profiles, media, payment ledger, auth identity, and admin auditability.

Exact Cursor task recommendation: Add an operations evidence file with current Supabase backup status, retention, storage mirror cadence, owner, and last restore-drill date. Add a non-production restore checklist artifact showing `pg_restore` to staging plus `node scripts/verify-database.mjs` results. Do not commit secrets or backup files.

### 9. Bundle performance guard is static and initial app still imports core member pages eagerly

Severity: P2

Files involved:

- `scripts/test-bundle-performance.mjs`
- `src/App.tsx`
- `src/app/lazyRoutes.ts`
- `vite.config.ts`

Root cause: The performance test verifies some lazy-route boundaries and dynamic `heic2any`, but it does not build or enforce byte budgets. `src/App.tsx` still eagerly imports main member pages such as Home, Discover, Likes, Chats, Profile, Onboarding, Landing, and Guest Discover.

User impact: Slower cold start and higher memory pressure on lower-end Android devices or poor Nigerian mobile networks.

Probability: Medium.

Operational impact: Medium. Performance regressions can ship without a failing check because current bundle test is not size-based.

Exact Cursor task recommendation: Add a non-mutating bundle budget check that reads a fresh build manifest in CI/release artifacts and fails on main JS/CSS size regressions. Continue route-level lazy loading for member pages with high dependency weight, while keeping payment return and auth recovery paths safe.

### 10. Production logs still include raw member/admin identifiers outside redaction helpers

Severity: P3

Files involved:

- `api/auth/pin-login.js`
- `api/auth/pin-reset.js`
- `server/services/pinLogin.js`
- `server/adminConsent.js`
- `src/utils/paymentState.ts`

Root cause: Observability redaction exists, but several code paths use direct `console.info()` or custom log helpers with raw `username`, `email`, or payment detail objects. The identity-exposure tests focus on response bodies, not log privacy.

User impact: Member identifiers can appear in application logs during failed login/reset/admin PIN/payment flows.

Probability: High during normal operations.

Operational impact: Low to Medium. Logs become more sensitive, retention requirements increase, and incident review must treat log access as PII-bearing.

Exact Cursor task recommendation: Replace auth/admin/payment console logs with `logObservabilityEvent()` or a small redacted wrapper. Log stable event names, request IDs, hashed identifiers, attempt counts, and reason codes instead of raw emails/usernames.

### 11. Media storage is public-object based and cleanup is manual

Severity: P3

Files involved:

- `server/services/photoStorage.js`
- `server/services/voiceIntroStorage.js`
- `scripts/reconcile-photo-orphans.mjs`
- `docs/runbooks/storage-restore.md`

Root cause: Photo and voice buckets are created as public buckets for app rendering. Pending-review media is not surfaced publicly by the app, but objects are still public if their URL is known. Orphan cleanup exists as a manual script/runbook path, not a scheduled operational process.

User impact: Unapproved uploads are not discoverable through the app, but a leaked URL remains fetchable. Deleted/replaced media can also accumulate until manual cleanup.

Probability: Low to Medium.

Operational impact: Medium over time: storage growth, broken references after restores, and a stricter privacy posture may later require signed URLs or lifecycle cleanup.

Exact Cursor task recommendation: Add a scheduled or operator-run storage reconciliation procedure that reports orphan counts and stale unapproved objects. For privacy hardening, evaluate moving pending-review objects to signed URLs or a private bucket until approval, without breaking approved public rendering.

### 12. Readiness probe can create diagnostics-denied log noise

Severity: P3

Files involved:

- `server/app.js`
- `server/services/diagnosticsAccess.js`
- `server/services/readiness.js`
- `Dockerfile`

Root cause: Docker healthcheck uses `GET /ready`. The GET handler attempts diagnostics access before returning a non-detailed readiness payload, so ordinary unauthenticated probes log `diagnostics_access_denied`.

User impact: None.

Probability: High in production because healthchecks run continuously.

Operational impact: Low to Medium. Log noise can obscure real unauthorized diagnostics access or readiness events.

Exact Cursor task recommendation: Keep `/ready` public for minimal readiness and move detailed readiness to `/ready?detail=1` or `/api/diagnostics/readiness` behind diagnostics access. Ensure Docker probes do not emit diagnostics-denied logs.

## Areas That Look Production-Strong

- Payment price/duration authority: server catalog and stored purchase intent are used for initialization and fulfillment.
- Payment persistence: payment DB unavailability returns 503 and prevents false success.
- Webhook correctness: signature gate and alias consolidation are implemented through one shared handler.
- Entitlement separation: Signal Pass, Fast Connection, and boosts are not conflated in shared/client entitlement helpers.
- Auth/session reliability: protected member APIs use Supabase bearer auth and reject body identity mismatch.
- Media trust: member upload approval is server-owned, with privileged statuses protected from member payloads.
- Public photo filtering: public city/discover profile payloads use approved photos only.
- Readiness split: `/health` liveness and `/ready` dependency readiness are separated.
- Android release safety: asset parity, signing-file guard, version bump, and release build order are enforced.
- Service worker safety: API requests bypass the worker; navigations are network-only; stale caches are deleted.
- Observability baseline: request IDs, thresholded alert logs, redaction helper, and critical event names exist.
- Runbook baseline: backup, restore, deployment, storage, and payment recovery runbooks are present and tested for coverage.

## Recommended Next Cursor Task

Fix the two P1 launch gates in one focused hardening task:

1. Lock down or disable `/api/admin/bootstrap` in production with a dedicated one-time bootstrap secret and no query/body secret acceptance.
2. Restore Docker integrity script separation so `npm run test:docker-integrity-stages` passes.
3. After those pass, run and document one real Paystack payment plus signed webhook entitlement activation.
