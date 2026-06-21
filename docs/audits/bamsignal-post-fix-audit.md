# BamSignal Post-Fix Audit

## Executive Summary

This was a fresh audit of the BamSignal repository after the listed stabilization fixes. No code was changed as part of this audit.

The system is materially more stable than an early launch build: server import smoke passes, TypeScript passes, source-integrity tests pass locally, public/member/admin route separation is mostly explicit, and the primary admin session flow now validates against the server instead of trusting client storage.

However, the current codebase is not ready for full public launch without another stabilization pass. The largest remaining risk is that many member data actions still trust identity supplied in the request body instead of deriving identity from a verified server-side session. That creates a launch-blocking authorization issue that affects profile reads, social actions, onboarding repair, account state changes, and other member operations. The next highest risks are missing endpoint-level throttling for PIN login, public visibility of pending or moderation-blocked photos, stale Android bundled assets, and payment fulfillment paths that are not fully idempotent across repeated webhooks and repeated purchases.

Verification performed during this audit:

- `npm run test:source-integrity` passed.
- `npm run test:server-import` passed.
- `npx tsc --noEmit` passed.
- `npm run android:verify-assets` failed because Android bundled assets and build markers do not match the current `dist`.
- `du -sh dist` reported `7.7M`.

## Launch Readiness Score (/100)

64/100

Rationale: the app has a workable launch foundation, but one P0 authorization issue and several P1 launch risks remain. Full launch should wait until member APIs are session-bound, Android asset parity passes, photo moderation visibility is corrected, auth throttling is added, and payment fulfillment is made durably idempotent.

## Top Remaining Risks

### 1. Unauthenticated member data actions trust body identity

Severity: P0

Area: Authentication, Database, Security

Files involved:

- `api/member/data.js`
- `src/services/memberData.ts`
- `src/services/cityHome.ts`
- `src/services/contactExchange.ts`
- `src/services/memberTrust.ts`
- `src/services/premiumStatus.ts`
- `server/db.js`

Root cause: `api/member/data.js` normalizes `email`, `phone`, and `username` from the JSON body and then executes many sensitive actions without requiring or verifying a Supabase bearer token. Username resolution happens server-side, but the resolved identity is still based on caller-provided data rather than an authenticated principal.

User impact: an attacker who knows or guesses a member email, phone, or username can potentially pull member bundles, inspect account state, mutate profile state, send or accept signals, ignore/decline requests, change onboarding state, pause or restore accounts, and access social/referral/contact-exchange data.

Exact Cursor task recommendation: Require Supabase bearer authentication for every non-public `/api/member/data` action. Derive `user_key`, email, and phone from the verified token on the server. Reject mismatches between token identity and body identity. Keep only intentionally public actions such as discovery/search/profile preview unauthenticated, and return a minimized public payload for those actions.

### 2. PIN login lacks endpoint-level brute-force protection

Severity: P1

Area: Authentication, Security

Files involved:

- `api/auth/pin-login.js`
- `server/services/pinLogin.js`
- `server/services/rateLimit.js`
- `api/auth/pin-reset.js`

Root cause: the username plus PIN flow relies on a six-digit PIN but does not enforce a durable IP plus username attempt limit in the login endpoint. The existing rate limiter covers discovery/profile-feed style actions, not auth attempts.

User impact: known usernames can be attacked through repeated PIN attempts. This is especially risky because usernames are expected to be discoverable or shareable.

Exact Cursor task recommendation: Add a database-backed auth attempt limiter for PIN login and PIN reset completion. Key by normalized username plus IP/device fingerprint, enforce temporary lockouts, use generic error responses, and log failed attempts without exposing whether the username exists.

### 3. Pending, hidden, or rejected photos can leak into public surfaces

Severity: P1

Area: Photo System, Security

Files involved:

- `api/member/photos.js`
- `shared/photoReview.mjs`
- `shared/mainPhoto.mjs`
- `server/cityHome.js`
- `server/memberSocial.js`
- `src/components/ProfilePhotoManager.tsx`
- `src/components/admin/PhotoModeration.tsx`

Root cause: newly uploaded photos are marked `pending_review`, but the shared public filter only excludes `rejected` and `hidden`. In addition, server payloads still use `discoverPhotoFromProfile(profile)` for the primary card photo, which can bypass the filtered public photo list.

User impact: unreviewed photos, risky photos, or photos hidden by moderation can still appear as the main discovery/home/social image. This weakens the upload-first moderation model and can expose contact information or policy-violating images.

Exact Cursor task recommendation: Change public photo selection to allow only approved photos, or at minimum exclude pending photos with any moderation risk. Update `discoverPhotoFromProfile` usage so main, cover, and card photos are selected from the same filtered public photo set. Add regression tests for pending, hidden, rejected, and approved combinations.

### 4. Photo review records can be unattributed and storage can orphan files

Severity: P1

Area: Photo System, Database, Storage

Files involved:

- `api/member/photos.js`
- `server/services/photoReview.js`
- `src/services/profilePhotos.ts`
- `src/utils/photoUploadResult.ts`
- `src/components/ProfilePhotoManager.tsx`
- `src/pages/OnboardingPage.tsx`
- `src/pages/ProfilePage.tsx`

Root cause: photo upload finalization submits review immediately after storage upload, before the profile record necessarily contains the new URL. The upload request body does not consistently include `profileId`, `memberName`, or a server-derived user key. Server-side review lookup can therefore create rows with `profile_id` and `user_key` missing. If a later profile sync fails, the uploaded object can remain unattached.

User impact: admins may see moderation items that cannot be reliably tied back to a member profile. Hidden/deleted moderation actions may fail to update the visible member record. Failed profile saves can leave storage objects and review rows behind.

Exact Cursor task recommendation: Make photo upload an authenticated attach operation. Derive user identity from the bearer token, resolve the member profile server-side, store the object, attach it to the profile, and create the review row in one server-owned flow. Add a cleanup/reconciliation job for unattached storage objects and orphaned review rows.

### 5. Android bundled assets are stale relative to current dist

Severity: P1

Area: Android, Deploy

Files involved:

- `scripts/verify-android-assets.mjs`
- `scripts/build-android-release.mjs`
- `capacitor.config.ts`
- `dist/index.html`
- `public/sw.js`
- `android/app/src/main/assets/public/index.html`
- `android/app/src/main/assets/public/sw.js`

Root cause: `npm run android:verify-assets` shows different build markers, JS files, CSS files, and service worker cache markers between `dist` and `android/app/src/main/assets/public`.

User impact: an Android release can ship older app code than the web build. Testers or Play Store users may continue seeing already-fixed bugs, including stale service worker behavior.

Exact Cursor task recommendation: Rebuild web assets, run Capacitor sync/copy, then rerun `npm run android:verify-assets` until markers and asset names match. Add the verification command as a required release/CI gate before producing an APK or AAB.

### 6. Payment fulfillment is not fully durable and idempotent

Severity: P1

Area: Payments, Database

Files involved:

- `api/paystack/verify.js`
- `api/webhooks/paystack.js`
- `server/routes/paystack.js`
- `server/db.js`
- `server/services/paymentEvents.js`
- `server/services/purchaseEmail.js`
- `src/services/payments.ts`
- `src/utils/activeBoosts.ts`

Root cause: premium and pass activation store a single `paystack_reference` on `app_users`, which can be overwritten by later purchases. Old webhook retries can then stop being deduped by the app user row. City placement dedupe checks exist, but the placements table does not appear to enforce a unique `paystack_reference` at the database level. Some boost purchases are activated in local client state rather than a durable server ledger.

User impact: repeated webhooks or callback verification can reapply older purchases, duplicate placements, or lose non-durable boost activations across devices. Purchase emails are better protected by `payment_events`, but fulfillment itself is not consistently ledger-claimed first.

Exact Cursor task recommendation: Create a single payment fulfillment ledger keyed by unique Paystack reference. Claim the reference before fulfillment, store every purchase as an append-only record, and make all entitlement/boost/placement changes idempotent off that ledger. Add a database uniqueness constraint for city placement references.

### 7. Diagnostics endpoints expose security posture without authentication

Severity: P1

Area: Admin, Observability, Security

Files involved:

- `api/diagnostics/view-security.js`
- `api/diagnostics/function-security.js`
- `api/diagnostics/paystack-connectivity.js`

Root cause: two diagnostics endpoints return security status on `GET` without requiring the diagnostics secret or an admin bearer token. The Paystack diagnostics endpoint is stricter, so the pattern is inconsistent.

User impact: unauthenticated callers can enumerate internal database function/view hardening status and implementation names, which gives attackers reconnaissance data.

Exact Cursor task recommendation: Require the diagnostics secret or a verified admin session for all diagnostics endpoints, including `GET`. Return a generic 404 or 401 for unauthenticated requests and avoid exposing internal object names publicly.

### 8. Open App fast path can route before onboarding status is freshly repaired

Severity: P2

Area: Authentication, Onboarding, Performance

Files involved:

- `src/App.tsx`
- `src/components/MemberRouteGuard.tsx`
- `src/services/memberData.ts`
- `src/utils/memberSession.ts`
- `src/constants/routes.ts`

Root cause: the Open App flow validates the Supabase session, immediately enters the member shell and navigates to `/home`, then runs background repair to resolve onboarding status. The route guard protects known incomplete profiles, but stale client state can briefly classify an incomplete member as home-ready until the repair result arrives.

User impact: incomplete users can briefly see dashboard chrome or home state before being redirected to onboarding. This does not appear to be an infinite loading deadlock, but it weakens the `/home` versus `/onboarding` invariant.

Exact Cursor task recommendation: Keep the fast server-session validation, but do not navigate to `/home` until a fresh lightweight onboarding status check confirms completion. Preserve the fast path only for users with a server-confirmed completed profile.

### 9. Admin action PIN has no attempt throttling

Severity: P2

Area: Admin, Security

Files involved:

- `api/admin/consent.js`
- `server/adminConsent.js`
- `server/adminAuth.js`
- `src/components/admin/AdminShell.tsx`

Root cause: sensitive admin actions use an action PIN, but the verification path does not enforce per-admin or per-IP attempt limits. The primary admin session is server-validated, which lowers severity, but the second factor can still be brute-forced after session compromise.

User impact: if an admin session is stolen or left open, an attacker can repeatedly attempt the action PIN online.

Exact Cursor task recommendation: Add durable failed-attempt tracking and temporary lockouts for admin action PIN verification. Key by admin user plus IP, log failed attempts, and require reauthentication after repeated failures.

### 10. Docker/build checks can miss source-integrity regressions

Severity: P2

Area: Deploy, Build

Files involved:

- `Dockerfile`
- `scripts/source-integrity-check.mjs`
- `scripts/smoke-server-import.mjs`
- `package.json`

Root cause: source-integrity tests pass locally, but the Docker runtime smoke is intentionally focused on server import/runtime. The source-integrity script skips when `src/` is absent, which means runner-stage checks cannot detect source-level regressions.

User impact: a deploy image can pass runtime smoke while missing source-integrity guarantees that caught previous launch issues.

Exact Cursor task recommendation: Run `npm run test:source-integrity` in the Docker builder stage immediately after install/build while `src/` exists. Keep the runner smoke as a separate runtime check.

## Auth

Username plus PIN flow exists and is routed through `api/auth/pin-login.js` and `server/services/pinLogin.js`. The flow includes Supabase session repair behavior and avoids relying only on stale local member state.

Remaining findings:

- P0: member actions in `api/member/data.js` are not consistently bound to a verified bearer token. This is the highest risk in the audit because it bypasses the intended login/session model for many member operations.
- P1: PIN login lacks endpoint-level durable throttling and lockout.
- P2: admin action PIN lacks throttling after an admin session is established.
- P2: Open App fast path validates the session but can navigate before onboarding status is freshly confirmed.

No static evidence of a hard infinite login loop was found. The larger issue is not a loop; it is that some server APIs accept caller-supplied identity after login has been improved elsewhere.

## Onboarding

The app has explicit onboarding detection and repair paths through `repairOnboardingStatus`, route guards, and server member data actions. `MemberRouteGuard` is the main protection that keeps completed users out of onboarding and incomplete users out of home once the relevant state is known.

Remaining findings:

- P2: `/home` does not directly render the onboarding page, and `/onboarding` does not directly render the dashboard, but the Open App fast path can temporarily navigate to `/home` before a fresh server onboarding status result returns.
- P2: onboarding repair is exposed through `api/member/data.js`; until that endpoint derives identity from a verified token, onboarding state changes inherit the P0 member authorization risk.
- P3: onboarding status logic is spread across `App.tsx`, `MemberRouteGuard`, member data services, and local session utilities. This increases regression risk even though the current route separation is mostly explicit.

Recommended stabilization: make onboarding status a server-confirmed precondition for `/home`, then add route tests for completed, incomplete, stale-session, and repaired-session cases.

## Routing

Public, member, admin, legal, SEO, auth, and payment routes are mostly separated by constants and early App-level branches. Admin route handling is isolated from the normal member shell, and public SEO routes are not obviously sharing member layout code.

Remaining findings:

- P2: `/payment/success` is listed among member app paths for restore blocking, but `parseMemberPath` does not treat it as a member route. The Paystack callback branch handles the main flow, but route classification is inconsistent.
- P2: the Vite dev API plugin covers only a subset of API routes. Local dev behavior can differ from Docker/prod unless the separate server is running.
- P3: `App.tsx` remains a high-risk coordination point for public/member/admin/payment/onboarding state. No duplicate layout leak was confirmed, but the file is large enough that future route changes are easy to regress.

No confirmed SEO route cross-contamination was found in the static review.

## Payments

Paystack initialize, verify, webhook, callback handling, Signal Pass style premium flows, city boosts, and purchase email helpers are present. Purchase email sends are better protected than entitlement fulfillment because `payment_events` is used to avoid duplicate email sends.

Remaining findings:

- P1: payment fulfillment is not consistently claimed by a unique ledger before side effects run.
- P1: `app_users.paystack_reference` stores only one reference, so later purchases can overwrite earlier dedupe state.
- P1: city placement duplicate checks are application-level; database uniqueness for Paystack reference should enforce this under concurrency.
- P2: non-city boosts appear to rely on client local activation state, which can be lost across devices or sessions.
- P3: Paystack webhook logic exists in both serverless-style and Express route files. This duplication can drift.
- P3: payment route classification for `/payment/success` is inconsistent between route constants and member-route parsing.

No strong evidence of duplicate purchase emails was found, but duplicate or lost fulfillment remains possible.

## Photo System

The photo system supports multi-upload, main photo selection, cover photos, review states, hidden states, and admin moderation. Upload-first moderation is implemented, but the visibility and attribution boundaries are still too loose for launch.

Remaining findings:

- P1: `pending_review` photos remain publicly visible under the shared public filter.
- P1: the main discovery/card photo can bypass public photo filtering.
- P1: photo review rows can be created without a reliable `profile_id` or `user_key`.
- P1: uploaded storage objects can become orphaned when upload succeeds but profile sync fails.
- P2: cover photo replacement can create inconsistent storage/profile state if the new upload succeeds but the later profile save fails.

Recommended stabilization: move from "upload then client syncs profile" to an authenticated server-owned "upload and attach" operation, and select all public display photos from one approved-photo filter.

## Admin

Admin login and shell validation now lean on server state. The main admin session path does not appear to trust localStorage as the source of truth, which is a meaningful improvement.

Remaining findings:

- P1: public diagnostics endpoints expose security status without authentication.
- P2: admin action PIN verification lacks throttling.
- P3: admin bootstrap can return a generated password in the HTTP response when authorized by a secret. This is acceptable for controlled setup but should be treated carefully in logs and operational tooling.

Recommended stabilization: require server authorization for every admin and diagnostics read, and add attempt controls to the action PIN path.

## Deploy

The server entrypoint consolidation appears to be working. `npm run test:server-import` passed, and the Docker smoke/runtime split is clearer than a single build-only check.

Remaining findings:

- P2: source-integrity tests are not guaranteed inside the Docker build path while source files are present.
- P2: Vite dev API coverage is partial, which can hide dev/prod differences.
- P3: `/health` is useful but exposes detailed service readiness booleans publicly. This is operationally convenient but can leak environment posture.

Recommended stabilization: keep runtime smoke, add source-integrity to the builder stage, and decide whether detailed health output should require an internal secret.

## Android

Capacitor and Android release tooling exist, and there is an asset parity verifier. The verifier is doing useful work: it caught stale Android assets in this audit.

Audit result:

- `npm run android:verify-assets` failed.
- `dist` build marker: `bamsignal-v1.0.13-16-mqmfznmm`
- Android build marker: `bamsignal-v1.0.13-16-mqma2g1n`
- `dist` JS assets: `assets/index-Cw-Jwyac.js`, `assets/supabase-Be25SE7n.js`
- Android JS assets: `assets/index-zZVLciOo.js`, `assets/supabase-DSfU6BIQ.js`
- `dist` CSS asset: `assets/index-ByNDs1Kq.css`
- Android CSS asset: `assets/index-iROm_tCt.css`

Remaining findings:

- P1: Android assets are stale relative to the current web build.
- P1: service worker cache markers differ between `dist` and Android bundled public assets.

Recommended stabilization: do not produce a release APK/AAB until build, sync, and asset parity verification all pass in the same release run.

## Performance

No confirmed infinite "Opening..." deadlock was found in static review. The remaining performance risk is mostly load weight and duplicated background work rather than a clear blocking loop.

Remaining findings:

- P2: `dist` is 7.7M, and initial app CSS is broadly imported through `src/main.tsx`.
- P2: public, member, admin, SEO, screenshot, and utility styles are eagerly imported together.
- P2: Open App performs fast routing plus background repair; this is good for perceived speed but can cause duplicated status/data work and stale-state flashes.
- P3: large optional capabilities such as image processing, OCR, HEIC handling, and admin tooling should remain lazy-loaded and kept out of the first member shell where possible.

Recommended stabilization: preserve the faster Open App behavior, but split route-specific CSS and heavy admin/photo tooling away from the first member render.

## Observability

The app has a health endpoint, server logs, an app error boundary, and crash recovery utilities. These are useful, but several failure paths remain silent or local-only.

Remaining findings:

- P2: client crash/error information is stored or logged locally but not consistently sent to a server-side error trail.
- P2: several service helpers catch errors and return empty arrays, `false`, or fallback objects without emitting structured diagnostic events.
- P3: `/health` exposes detailed internal booleans publicly.
- P3: diagnostics endpoint authorization is inconsistent.

Recommended stabilization: add a privacy-safe server error intake for critical client failures and background sync failures. Include route, build marker, action name, and sanitized error class.

## Database

The server uses direct Postgres access through service code. That can be reliable, but it means application authorization checks must be airtight because database RLS is not the primary enforcement point for these API paths.

Remaining findings:

- P0: member data actions are not consistently tied to a verified server-side user identity.
- P1: payment fulfillment needs a unique reference ledger and stronger database constraints.
- P1: photo review rows can be created without reliable profile/user references.
- P2: storage objects can outlive failed profile attachment flows.
- P2: public health/diagnostic status can reveal database/security posture.

Recommended stabilization: add hard database constraints where possible, especially for payment references and photo review ownership. Do not rely on client-supplied member identity for any database mutation.

## Security

Environment files and signing keys were not found tracked in the repository, aside from `android/app/google-services.json`, which is commonly expected for Firebase Android configuration. The largest remaining security concerns are authorization, throttling, and diagnostics exposure.

Remaining findings:

- P0: `/api/member/data` permits sensitive actions based on caller-supplied identity.
- P1: PIN login lacks durable brute-force protection.
- P1: public photo visibility can expose unreviewed or moderation-blocked content.
- P1: diagnostics GET endpoints disclose internal security status.
- P2: admin action PIN lacks throttling.
- P2: `/health` exposes detailed service configuration posture.
- P3: admin bootstrap password response should be tightly controlled operationally.

Recommended stabilization: treat authentication, authorization, rate limiting, and diagnostic access as launch blockers, then run a focused security regression pass.

## Recommended Next 10 Fixes

1. Lock down `/api/member/data` so all non-public actions require a verified Supabase bearer token and derive identity server-side.
2. Add durable IP plus username throttling and lockout to PIN login and PIN reset completion.
3. Change public photo filtering so pending, hidden, rejected, and risky photos cannot appear in discovery, home, or profile preview surfaces.
4. Convert photo upload into an authenticated server-owned upload-and-attach flow with profile/user attribution and orphan cleanup.
5. Rebuild, Capacitor sync, and verify Android assets until `npm run android:verify-assets` passes; make that a release gate.
6. Add a unique payment fulfillment ledger keyed by Paystack reference and drive all entitlements, boosts, placements, and purchase emails from that ledger.
7. Require diagnostics secret or verified admin session for all diagnostics endpoints, including `GET`.
8. Gate Open App `/home` routing on a fresh server-confirmed completed onboarding status.
9. Add failed-attempt tracking and temporary lockout for admin action PIN verification.
10. Run `npm run test:source-integrity` in the Docker builder stage while `src/` exists, before the runner-stage smoke test.
