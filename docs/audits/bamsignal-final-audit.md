# Executive Summary

BamSignal has a mature production shape after the completed fixes: member auth is centralized on bearer sessions, public/member route separation exists, Docker has builder/runtime separation, photo upload attribution exists, payment ledger tables exist, and source/Docker integrity checks pass.

The codebase is not yet ready for a monetized production launch. Two P0 blockers remain in payments: purchase price/duration are still partly client-controlled, and payment fulfillment can return success or acknowledge webhooks while database persistence is unavailable. The next highest risks are trust-boundary issues in photo review/profile media, fail-open readiness, public identity data exposure, throttling dependence on the database, profile sync races, and webhook implementation drift.

Launch Readiness Score: 68/100

Validation performed:

- `npm run test:source-integrity` passed.
- `npm run test:docker-integrity-stages` passed.
- `npx tsc --noEmit` passed.
- `npm run build` was not run because the build script writes generated files (`public/sitemap.xml`, `public/sw.js`, `src/buildInfo.ts`) and this audit was requested as no-code-change work.

Pre-existing dirty files were observed and left untouched: `public/sitemap.xml`, `public/sw.js`, `src/buildInfo.ts`, and `docs/audits/bamsignal-post-fix-audit.md`.

## Top Remaining Risks

### 1. P0 - Client-controlled payment price and entitlement duration

Files involved:

- `api/paystack/verify.js:112-123`
- `api/paystack/verify.js:196-234`
- `api/paystack/verify.js:267-306`
- `api/paystack/verify.js:332-371`
- `api/paystack/verify.js:458-723`
- `server/routes/paystack.js:26-39`
- `server/routes/paystack.js:100-127`
- `api/webhooks/paystack.js:27-32`
- `api/webhooks/paystack.js:63-110`
- `api/webhooks/paystack.js:157-168`

Root cause: Paystack initialization accepts client `amount`, `days`, `durationHours`, and related product metadata, then verification/webhook logic validates against `metadata.expected_amount_kobo`, which was derived from the same client-controlled values. Premium, quickie, and boost fulfillment also use metadata duration fields before deriving entitlements from an authoritative server catalog.

User impact: A user can craft a direct API request that pays a smaller amount while receiving a longer premium, quickie, or boost entitlement.

Probability: High. The affected endpoints are client-callable and only require request manipulation.

Operational impact: Direct revenue loss, entitlement disputes, contaminated payment ledger data, and weakened trust in purchase support records.

Exact Cursor task recommendation: Make Paystack purchases server-authoritative. Accept only server-known product/plan IDs from clients, derive amount and duration from the active server catalog, store a server-side purchase intent by reference, verify Paystack amount/product against that server intent, ignore client/metadata duration overrides during fulfillment, and add regression tests for tampered premium, quickie, and boost amount/duration requests on both verify and webhook paths.

### 2. P0 - Payment fulfillment can falsely succeed when the database is unavailable

Files involved:

- `server/db.js:36-42`
- `server/db.js:224-229`
- `server/services/paymentFulfillments.js:15-29`
- `server/services/paymentFulfillments.js:68-74`
- `server/services/paymentEvents.js:28-34`
- `server/services/paymentEvents.js:57-60`
- `server/services/paymentEvents.js:96-100`
- `api/paystack/verify.js:470-512`
- `api/paystack/verify.js:515-723`
- `server/routes/paystack.js:85-180`
- `server/routes/paystack.js:183-197`
- `api/webhooks/paystack.js:171-212`

Root cause: The server is allowed to continue without database persistence, `query()` returns empty success-shaped results while disconnected, and payment ledger helpers return `null` or `false` instead of failing. Payment verification and webhook handlers can still proceed to `ok: true` responses or HTTP 200 acknowledgements even when fulfillment, ledger writes, or subscription events were not persisted.

User impact: A customer can be charged and see a success response while their entitlement is missing or only locally reflected. A Paystack webhook can be acknowledged, preventing retry, even though the durable fulfillment record was not written.

Probability: Medium. It requires database outage, misconfiguration, or startup in dry-run mode, but the server explicitly supports that degraded mode.

Operational impact: Payment loss, manual reconciliation burden, webhook replay gaps, incorrect support answers, and possible premium/boost state divergence.

Exact Cursor task recommendation: Fail closed for payment write paths. Require `isDatabaseReady()` before Paystack verify/webhook fulfillment, return 503 for database-unavailable webhook handling so Paystack retries, never return `ok: true` when activation or ledger writes return `null`, add a required-query helper that throws for payment writes, and add tests that simulate disconnected database behavior for verify and webhook handlers.

### 3. P1 - Member photo review status can be forged into public visibility

Files involved:

- `shared/photoReview.mjs:16-26`
- `api/member/data.js:434-501`
- `server/utils/profileMerge.js:14-59`
- `api/member/photos.js:130-156`
- `server/services/photoReview.js:272-352`

Root cause: Public filtering correctly shows only photos with `photoReviewStatus === "approved"`, but member-controlled profile sync can submit `photoMeta`, and the member photo `submit-review` route accepts `photoReviewStatus` from the request body. The server then applies that status into `app_member_profiles.profile.photoMeta`.

User impact: A malicious or modified client can mark an unreviewed photo as approved and make it eligible for public discovery/member surfaces.

Probability: Medium-high. It requires crafted API calls, but no admin credential is needed on the member routes.

Operational impact: Moderation bypass, unsafe public media exposure, trust/safety incidents, and cleanup work across profile JSON and `photo_reviews`.

Exact Cursor task recommendation: Make review status server-owned. Strip or normalize incoming member `photoMeta` in profile sync, force member-submitted reviews to `pending_review`, reject non-storage or non-owned public photo URLs, allow only admin review routes to set `approved`, and add regression tests proving member routes cannot create approved public photos.

### 4. P1 - Health checks report healthy while critical dependencies are down

Files involved:

- `server/app.js:46-66`
- `server/app.js:103-108`
- `server/db.js:36-42`
- `server/db.js:224-229`
- `Dockerfile:77-78`

Root cause: `/health` always returns HTTP 200 with `ok: true`, even when the payload says the database or critical services are unavailable. Docker only checks `r.ok`, so a Coolify/container deployment can remain healthy while persistence, payment, email, or photo storage dependencies are not usable.

User impact: Users can reach an apparently healthy app that fails during signup, login, payment fulfillment, upload, or email flows.

Probability: Medium. Any dependency outage or missing production environment variable can trigger this.

Operational impact: Bad deploys stay in rotation, automated recovery will not fire, and payment/data incidents can continue unnoticed.

Exact Cursor task recommendation: Split liveness from readiness. Keep `/health` as a minimal liveness endpoint, add `/ready` that returns 503 when database, Paystack secret, signup email, and required storage checks fail, update Docker `HEALTHCHECK` to `/ready`, and add tests for missing database/payment/storage/email readiness states.

### 5. P1 - Pre-auth and control-plane endpoints expose sensitive account/admin state

Files involved:

- `api/auth/identity.js:258-291`
- `server/db.js:261-294`
- `api/admin/bootstrap.js:21-48`
- `api/admin/moderation.js:126-172`

Root cause: Public identity actions can return raw `app_users` rows or premium state from asserted email/phone input. Admin bootstrap accepts broad operational secrets (`CRON_SECRET` or `DIAGNOSTICS_SECRET`) and returns the generated/admin password in the response. Photo moderation mutation routes require moderation admin access but do not consistently require the extra admin action PIN used by higher-risk admin actions.

User impact: Attackers can enumerate account existence and payment/premium-related fields if they know or guess identifiers. If an operational secret or admin session is compromised, the admin blast radius is larger than necessary.

Probability: Medium. Identifier guessing is easy; admin impact depends on secret/session exposure.

Operational impact: Privacy leakage, increased account-targeting risk, incident response complexity, and weakened admin trust boundaries.

Exact Cursor task recommendation: Harden identity and admin control paths. Require member bearer auth for status/push-token/register paths that touch existing account state, return only minimal pre-auth booleans where needed, never return raw `app_users` rows publicly, replace bootstrap access with a dedicated one-time bootstrap secret that is disabled after admin creation, and require admin action PIN for photo review approve/reject/hide/restore/delete or document a tested exception.

### 6. P1 - PIN and admin action throttles fail open during database outage

Files involved:

- `server/services/pinAuthThrottle.js:55-58`
- `server/services/pinAuthThrottle.js:124-130`
- `server/services/adminActionPinThrottle.js:45-48`
- `server/services/adminActionPinThrottle.js:108-115`
- `server/db.js:36-42`
- `server/db.js:224-229`

Root cause: PIN and admin action throttling depend on database rows. When the database is unavailable, checks return `ok: true` and write attempts are no-ops.

User impact: During degraded operation, PIN login/reset and admin action PIN protection can be brute-forced without the intended lockout behavior.

Probability: Medium-low. It requires both a database outage and attacker activity, but outages are exactly when defenses should be conservative.

Operational impact: Security posture weakens during incidents, and audit evidence for brute-force attempts is lost.

Exact Cursor task recommendation: Add fail-safe throttling for database outages. Use a bounded in-memory fallback keyed by action, identifier, IP, and user-agent hash for normal PIN flows; fail closed for admin action PIN when the database is unavailable unless an explicit audited break-glass path is configured; and add outage-mode throttle tests.

### 7. P1 - Profile/media sync uses last-write-wins JSON merges and silent failures

Files involved:

- `api/member/data.js:434-501`
- `api/member/data.js:460-471`
- `server/utils/profileMerge.js:14-59`
- `server/services/voiceIntroStorage.js:86-99`
- `src/pages/ProfilePage.tsx:297-306`
- `src/pages/ProfilePage.tsx:391-400`
- `src/pages/ProfilePage.tsx:891-904`

Root cause: Profile sync replaces the merged profile JSON without version or field-level preconditions. Some client media updates write local state first and then fire remote sync in the background, returning silently when sync fails. Voice intro profile sync only checks that a URL contains the public `voice-intros` storage path instead of parsing and enforcing ownership with the existing owner helper.

User impact: Concurrent profile saves, photo uploads, voice intro changes, or verification selfie updates can overwrite newer fields or appear saved locally while the server remains stale. A member can also point their profile at another public voice-intro object.

Probability: Medium. Normal concurrent mobile/web usage and flaky networks can trigger stale writes; URL spoofing requires crafted requests.

Operational impact: Support tickets for lost photos/voice/profile changes, stale discovery state, and harder reconciliation because the profile JSON does not expose conflict intent.

Exact Cursor task recommendation: Make profile media writes conflict-aware. Add server-side patch actions or `updated_at` preconditions for profile subdocuments, reject stale full-profile writes that would overwrite newer media fields, enforce voice intro URL ownership with `parseVoiceIntroStorageUrl` plus `assertUserOwnsVoiceIntroPath`, surface media sync failures to the client, and add concurrent save/upload/voice regression tests.

### 8. P1 - Paystack webhook route drift and duplicate implementations remain

Files involved:

- `server/app.js:88-99`
- `server/app.js:143`
- `server/config.js:29-31`
- `server/routes/paystack.js:183-203`
- `api/webhooks/paystack.js:1-222`

Root cause: Express raw-body handling recognizes `/api/webhooks/paystack`, `/webhooks/paystack`, and `/api/paystack/webhook`, but the Express Paystack router only mounts `/webhooks/paystack` and `/api/paystack/webhook`. A separate standalone `api/webhooks/paystack.js` handler exists with divergent entitlement logic and is not mounted by the Express app.

User impact: If the Paystack dashboard or environment points to the unmounted `/api/webhooks/paystack` path in the Coolify/Express deployment, webhooks can 404. If the standalone handler runs in another environment, webhook behavior can diverge from the production Express route.

Probability: Medium. The configured default is `/api/paystack/webhook`, but the codebase advertises and parses more paths than it mounts.

Operational impact: Missed payment activations, inconsistent entitlement durations, harder replay/debugging, and duplicate maintenance burden.

Exact Cursor task recommendation: Consolidate Paystack webhook handling into one shared implementation. Mount all accepted paths to that implementation or remove unsupported paths, delete or convert the standalone handler into a thin import wrapper, verify the Paystack dashboard URL matches the mounted production path, and add route tests for each supported webhook URL.

### 9. P2 - Initial app shell and Android release size remain heavy

Files involved:

- `src/App.tsx:1-120`
- `src/main.tsx:1-33`
- `vite.config.ts:171-180`
- `android/app/build.gradle:38-48`
- `package.json:44-70`

Root cause: The main React entry imports public, member, admin, blog, SEO, store screenshot, payment, and dashboard surfaces eagerly. Global CSS imports are all loaded at startup. Vite manual chunks only split broad vendor libraries. Android release builds have `minifyEnabled false`.

User impact: Slower cold starts, higher WebView memory pressure, slower route recovery after service worker/chunk refresh, and more risk on low-memory Android devices.

Probability: Medium. Current `dist/assets` artifact shows `index-*.js` at about 778 KB raw, global CSS at about 372 KB raw, and a `heic2any` chunk at about 1.3 MB raw.

Operational impact: More performance complaints, higher crash probability on older devices, slower deploy smoke checks, and reduced scale headroom for asset delivery.

Exact Cursor task recommendation: Reduce startup payload without changing product behavior. Introduce route-level `React.lazy` boundaries for admin, SEO/blog, store screenshot, and heavy member surfaces; load specialized media tooling only where needed; keep payment/open-app critical routes eagerly available; then enable Android release shrinking/minification after smoke testing the signed AAB.

### 10. P3 - Observability, backup, and disaster recovery evidence is incomplete

Files involved:

- `src/utils/crashLog.ts:13-35`
- `src/utils/crashLog.ts:37-44`
- `src/utils/serviceWorker.ts:98-125`
- `public/sw.js:13-19`
- `server/services/paymentEvents.js:28-34`
- `scripts/verify-database.mjs`

Root cause: Client crashes are logged to console/sessionStorage only, service worker registration/update failures are swallowed, payment audit falls back to console only when the database is unavailable, and the repository does not include a committed backup/restore runbook, scheduled backup verification, alert rules, or restore drill evidence. `scripts/verify-database.mjs` exists, but it is not a backup or disaster recovery mechanism.

User impact: Incidents may be detected by users before operators, and recovery from data loss or failed deploys depends on manual knowledge outside the repo.

Probability: Medium. The gaps surface during outages, failed service worker updates, payment/email delivery problems, or database incidents.

Operational impact: Longer mean time to detect and recover, weaker audit trail during degraded mode, and higher risk of untested restore procedures.

Exact Cursor task recommendation: Add operational evidence, not product features. Commit a production runbook covering readiness alerts, payment/webhook failure alerts, email delivery failure alerts, client/server crash collection, backup schedule, backup verification, and restore drill steps; wire alerts to `/ready` and payment/webhook error counters; and add a non-destructive restore verification script or documented restore test procedure.

## Severity Summary

- P0: 2 issues. Payment tampering and payment fulfillment loss block monetized launch.
- P1: 6 issues. Photo trust boundary, readiness, identity/admin exposure, throttling outage behavior, profile/media races, and webhook drift should be fixed before broad launch.
- P2: 1 issue. Bundle/runtime size is not a correctness blocker but affects mobile reliability and scale readiness.
- P3: 1 issue. Operational evidence gaps do not directly break user flows, but they increase incident duration and recovery risk.

## Recommended Next Task

Fix the P0 payment layer first: make Paystack pricing/entitlement fulfillment server-authoritative and fail closed when the database is not ready. This single task should cover issue 1 and issue 2 together because both affect the same purchase lifecycle and both can cause direct revenue or entitlement loss.
