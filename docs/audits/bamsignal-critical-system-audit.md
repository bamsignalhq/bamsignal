# BamSignal Critical System Audit

Date: 2026-06-19
Scope: login, signup, onboarding/routing, payment return, Paystack activation and purchase email, profile photo upload/moderation, cache/service worker, Android release/AAB packaging, admin console, crash recovery, and security posture.

Constraint followed: audit only. No application source, build artifact, asset, dependency, or configuration file was changed. This report file is the only new file.

## Executive Summary

BamSignal has many of the right systems in place: canonical login/signup routes, server-side signup checks, OTP-backed signup, member route guards, Paystack server verification, purchase email idempotency, upload-first photo storage, service worker update handling, crash recovery, Android release scripting, and admin consent for destructive actions.

The release is not ready yet. The most serious problems are not cosmetic. They are failure modes that can make a valid release ship stale code, route paid users to the wrong place, trust a stale admin session locally, reject valid PIN logins when identity records are not linked exactly, or route an already-onboarded member back to Step 1 because the server resolves the wrong or incomplete profile.

Highest-risk launch blockers:

1. Android packaged web assets are stale relative to `dist` and `src/buildInfo.ts`; a Play AAB/APK can ship old JavaScript even if source and `dist` are fixed.
2. Payment return depends heavily on browser `localStorage`; fresh-tab/WebView callbacks can default to premium and `/home`, while the webhook only recovers premium purchases.
3. Admin hard-session validation can short-circuit on local storage before server verification.
4. PIN login is only as reliable as username/profile/auth metadata linkage; valid PIN users can fail when username records are missing, duplicated, or linked to a different email.
5. `/home` showing onboarding Step 1 is consistent with `profileComplete=false`; the guard is doing its job, but upstream member identity/status resolution can classify the wrong stub profile as incomplete.

Launch readiness score: **61/100**.

Verdict: **Do not submit a new Play production release until the P0/P1 items below are fixed and verified on a clean Android release build.**

## Top 10 Critical Issues

### 1. P0 - Android packaged assets are stale

Evidence:

- `src/buildInfo.ts:4-5` reports `CACHE_VERSION = "bamsignal-v1.0.13-16-mqlke9yf"`.
- `public/sw.js:1` also uses `bamsignal-v1.0.13-16-mqlke9yf`.
- `dist/index.html:22` has meta build `bamsignal-v1.0.13-16-mqlke9yf`.
- `android/app/src/main/assets/public/sw.js:1` still uses `bamsignal-v1.0.13-16-mqli2bje`.
- `android/app/src/main/assets/public/index.html:22` has only `bamsignal-v1.0.13-16`, and references older assets `index-BZGgWMVd.js` and `index-CrWApI6y.css`.
- Current `dist/index.html:32,37` references `index-Bg1CsT8z.js` and `index-D5LefkMj.css`.

Root cause:

The Android packaged `public` assets were not synced after the latest web build/cache version. The release script does clean and sync correctly, but the checked local Android asset directory does not match the current web output.

Impact:

The Play build can contain stale UI, stale routes, stale service worker cache names, stale auth/payment code, and stale bug fixes. This can make every other fix appear broken on Android even when web is correct.

Required fix:

Use `npm run android:release` as the only release path, or add a pre-release verifier that fails if:

- `android/app/src/main/assets/public/sw.js` cache name differs from `src/buildInfo.ts` / `public/sw.js`.
- `android/app/src/main/assets/public/index.html` build meta differs from `dist/index.html`.
- Android packaged asset names differ from `dist/index.html`.

### 2. P0 - Payment return relies on localStorage and can route/label purchases incorrectly

Evidence:

- `src/utils/paymentReturn.ts:15` defaults return path to `/home`.
- `src/utils/paymentReturn.ts:48-55` reads return path only from `localStorage`.
- `src/utils/paymentReturn.ts:57-66` defaults product metadata to `premium`.
- `src/services/payments.ts:91-99` stores return context and payment kind in `localStorage`.
- `src/services/payments.ts:430-446` reads callback reference from URL but reads product kind from `localStorage`, defaulting to `"premium"`.
- `src/services/payments.ts:486-489` then verifies through the premium branch when kind is missing.
- `api/paystack/verify.js:354` correctly prefers Paystack metadata product type over the client body, which helps server activation, but the client branch can still show wrong UI and route.
- `api/webhooks/paystack.js:56-85` activates/sends email only for premium-type webhook flows.

Root cause:

Payment return context is not encoded authoritatively into the callback route or recovered from the server by reference. The callback flow assumes the same browser storage survives Paystack/Capacitor/WebView handoff.

Impact:

Paid users can land on `/home` instead of the originating product/profile page. Boost/quickie purchases can be verified server-side but still presented as premium on the client. If the browser callback never completes, premium may recover through webhook but boost/quickie do not have equivalent webhook activation.

Required fix:

Make the payment reference the source of truth:

- Store product type, product id, return path/source page, user id/email/phone, and platform in server-side `payment_events` or equivalent at initialize time.
- Add a server endpoint to fetch payment return context by Paystack reference after verification.
- Make client callback call `verify(reference)` once, then branch from returned `productType`, not `localStorage`.
- Extend Paystack webhook handling to activate/send confirmation for boost and quickie, not only premium.

### 3. P0 - Admin hard session can validate from local storage without a server check

Evidence:

- `src/utils/adminSession.ts:243-272` calls `verifyAdminSession(token)` during hard-session validation.
- `src/utils/adminSession.ts:292-297` defines `isAdminSessionActive` from local hard session freshness.
- `src/services/plans.ts:112-114` returns `true` immediately if `isAdminSessionActive()` is true, before using the passed access token.
- `src/components/admin/AdminShell.tsx:30-40` relies on `validateHardSession()`.

Root cause:

The server-validation helper imports local-session state and trusts it. This creates circular validation: a fresh local hard session can make the server verifier return `true` without calling `/api/auth/identity?action=admin-session`.

Impact:

Revoked, expired, or no-longer-admin hard sessions can remain locally trusted until local TTL expires. This is a high-risk admin-console launch blocker.

Required fix:

Split helpers:

- `hasLocalHardSession()` should only answer whether a local record exists.
- `verifyAdminSession(accessToken)` must always call the server when a token is supplied.
- `validateHardSession()` should clear local hard session on any server validation failure.

### 4. P1 - Valid PIN login can fail when username identity is not perfectly linked

Evidence:

- `src/pages/AuthPage.tsx:428-475` posts username/PIN to the server, then sets Supabase session from returned tokens.
- `src/services/authEmail.ts:275-295` posts to `/api/auth/pin-login`.
- `server/services/loginResolve.js:32-42` finds member by username/profile username with `limit 1`.
- `server/services/loginResolve.js:59-70` finds auth user by username metadata with `limit 1`.
- `server/services/loginResolve.js:119-180` collects candidate emails from member, user key, app user, phone, auth user, profile JSON, and metadata.
- `server/services/loginResolve.js:183-197` sets `usernameFound = Boolean(member || authUser)`.
- `server/services/pinLogin.js:596-600` rejects immediately when `usernameFound` is false.
- `server/services/pinLogin.js:608-625` tries candidate emails, legacy fallback, then SQL fallback.

Root cause:

Login is username-first. If the account exists in Supabase/auth/app user records but the username is absent from `app_member_profiles` and `auth.users.raw_user_meta_data`, login fails before email/PIN verification. If duplicate username records exist, `limit 1` without deterministic ordering can bind the wrong profile/email.

Impact:

A real member can enter the correct username and PIN and still receive "Invalid username or PIN." This is especially likely after migrations, admin repair, legacy accounts, or duplicate stubs.

Required fix:

Create one authoritative login identity repair path:

- Enforce unique normalized username in the database.
- Resolve by username deterministically and detect duplicates as an admin-repair condition.
- When Supabase password grant succeeds, backfill username, email, phone, and auth user id into `app_member_profiles` and `app_users`.
- Add diagnostics for "username not found", "username duplicate", "no candidate email", "candidate email rejected", and "Supabase auth not configured" without logging the PIN.

### 5. P1 - `/home` showing onboarding Step 1 is an upstream status/identity issue

Evidence:

- `src/components/MemberRouteGuard.tsx:46-48` redirects any member surface to `/onboarding` when `profileComplete === false`.
- `src/App.tsx:828-845` starts authenticated flow and calls `goToApp()`.
- `src/services/goToApp.ts:62-85` returns route from `bootstrapMemberSession`.
- `src/services/memberData.ts:105-153` registers/hydrates member data, fetches onboarding status, then returns `home` or `onboarding`.
- `server/services/onboardingRepair.js:146-162` resolves member by email/phone first and only uses username fallback if no member was found.
- `server/memberSocial.js:696-746` fetches the member bundle by email/phone and returns dating profile from the resolved profile.
- `src/utils/onboardingStatus.ts:34-58` intentionally only trusts completion flags.
- `src/utils/onboardingStatus.ts:96-129` ignores template defaults and requires real profile data.

Root cause:

The route guard is not the root problem. It correctly blocks `/home` when the app believes onboarding is incomplete. The likely root is that `bootstrapMemberSession` or server onboarding-status is resolving a blank/duplicate member stub, or cannot find the completed profile by the login email/phone being used after authentication.

Impact:

Users may say "I logged in and went to home, but it shows Step 1." In reality, the app may navigate or replace to `/onboarding` because `profileComplete=false`. This can happen when completed profile state is present under a different email/phone/user key, while login/session identity points to a newer incomplete stub.

Required fix:

Use Supabase auth user id as a durable identity in member profiles and payment/admin repair where possible. Pass the resolved `loginEmail` from `AuthPage` into `goToApp`/`bootstrapMemberSession`. Add a server repair that merges duplicate stubs and prefers completed profiles over incomplete stubs when email/phone/username point to multiple records.

### 6. P1 - `goToApp` timeout falls back to `/home`

Evidence:

- `src/services/goToApp.ts:11` sets a 2000 ms timeout.
- `src/services/goToApp.ts:18-22` resolves timeout as `{ hydrated: false, status: null, nextRoute: "home" }`.
- `src/services/goToApp.ts:76-78` clears onboarding drafts when the result is home.
- `src/App.tsx:757-790` uses `goToApp()` for the Open App button and routes from its result.

Root cause:

Timeout is treated as successful home routing instead of an indeterminate/hydration-failed state.

Impact:

Slow member repair/hydration can route users to `/home` before status is known. Later state can redirect back to onboarding, producing flicker, slow Open App behavior, or confusing "home then Step 1" transitions.

Required fix:

Change timeout result to an explicit `hydration_timeout` error or "loading/retry" state. Do not default to home and do not clear onboarding drafts on timeout.

### 7. P1 - `server/index.js` is an incomplete API entrypoint

Evidence:

- `package.json:28-30` has both `start` -> `server/production.js` and `server`/`dev:server` -> `server/index.js`.
- `server/index.js:38-39` only mounts `/api/contact` and Paystack router.
- `server/production.js:124-155` mounts the actual auth, signup, member data, member photos, paystack verify, diagnostics, admin, city, and verification handlers.

Root cause:

There are two Express entrypoints with materially different API surfaces.

Impact:

Any deployment, process manager, developer, or Coolify config that starts `npm run server`, `npm run dev:server`, or `node server/index.js` will break login, signup OTP, member data, photo uploads, admin, and payment verification.

Required fix:

Either remove/deprecate `server/index.js`, or make it delegate to the same mounted app as `server/production.js`. Add a smoke test that hits `/api/auth/pin-login`, `/api/auth/email-code`, `/api/member/data`, `/api/member/photos`, and `/api/paystack/verify` against the configured server entrypoint.

### 8. P1 - Signup math challenge is process-local memory

Evidence:

- `src/pages/AuthPage.tsx:477-557` validates fields, legal acceptance, and math answer client-side.
- `src/pages/AuthPage.tsx:586-590` sends `legalAccepted`, `mathToken`, and `mathAnswer`.
- `server/services/signupOtp.js:157-186` enforces disposable email, legal acceptance, math challenge, and identity availability server-side.
- `server/services/signupMathChallenge.js:5-6` stores challenges in an in-memory `Map`.
- `server/services/signupMathChallenge.js:25-30` deletes the challenge token on any attempt.

Root cause:

The challenge store is not shared across instances and does not survive restarts.

Impact:

On multi-instance production, serverless cold starts, container restarts, or load-balanced requests, valid signups can fail the math gate. The error looks like the user answered incorrectly.

Required fix:

Store math challenge hashes server-side in Redis/Postgres with TTL, or sign the challenge token with HMAC and verify statelessly with expiry and replay protection.

### 9. P1 - Photo upload can still become hard-blocking under strict moderation or missing storage

Evidence:

- `src/components/PhotoUploadGrid.tsx:120-159` uploads concurrently and treats moderation rejection as a failed tile.
- `src/utils/profilePhotoUpload.ts:53-55` turns `moderationRejected` into a user-facing rejection.
- `src/services/profilePhotos.ts:90-115` retries 401/503 but throws on storage failure.
- `src/services/profilePhotos.ts:153-160` only allows data URL emergency fallback outside production.
- `api/member/photos.js:89-95` returns 503 when storage is not configured.
- `api/member/photos.js:32-39` deletes rejected photos after upload.
- `server/services/photoModerationProvider.js:17-23` defaults to `upload_first`, but `strict` is allowed.
- `server/services/photoModerationProvider.js:38-48` rejects when mode is `strict` and confidence is high.

Root cause:

The default path is upload-first/review, but one environment variable can switch production to strict rejection. Storage misconfiguration has no production fallback.

Impact:

Signup/onboarding can be blocked by moderation mode or storage config. That violates the desired "upload first, review later" experience.

Required fix:

Keep production `PHOTO_MODERATION_MODE=upload_first` unless there is a deliberate policy change. Add a boot health check that fails launch if photo storage is not configured. Convert strict rejection into pending review for onboarding-critical profile photos unless a legal/safety policy requires hard rejection.

### 10. P1 - Dependency audit currently fails with high vulnerabilities

Evidence:

`npm audit --audit-level=high` exited with code 1 and reported 21 vulnerabilities: 2 low, 12 moderate, 7 high.

High-severity packages/advisories included:

- `@grpc/grpc-js`
- `axios`
- `fast-xml-builder`
- `form-data`
- `protobufjs`
- `ws`
- `@babel/core` arbitrary file read advisory was also reported

Root cause:

Dependency tree is behind current patched versions.

Impact:

Some advisories may be dev-only, but the tree includes server/runtime packages. This is a launch-readiness and security-review gap.

Required fix:

Run dependency updates in a separate branch, prefer non-breaking `npm audit fix` first, then manually assess forced upgrades such as Vite and Firebase Admin. Re-run build/server smoke tests afterward.

## Detailed Findings

## Login and PIN Authentication

What is good:

- Login form posts username/PIN to a server endpoint, not directly to a client-only secret check.
- Server verifies through Supabase password grant and never logs the PIN value.
- Legacy PIN/profile hash repair exists.
- Login errors are mostly generic, reducing account-enumeration leakage.

Important files:

- `src/pages/AuthPage.tsx:428-475`
- `src/services/authEmail.ts:275-295`
- `api/auth/pin-login.js`
- `server/services/loginResolve.js`
- `server/services/pinLogin.js`

Exact failure chain for "valid user cannot log in":

1. The client normalizes the username and posts `{ username, password }` to `/api/auth/pin-login`.
2. `server/services/loginResolve.js` looks for the username in `app_member_profiles` or `auth.users.raw_user_meta_data`.
3. If neither has that username, `usernameFound=false`.
4. `server/services/pinLogin.js:596-600` returns "Invalid username or PIN." before attempting auth by email/phone.
5. If a username exists but points to a duplicate or incomplete member row, candidate emails can point to the wrong account.
6. If `VITE_SUPABASE_ANON_KEY`/`SUPABASE_ANON_KEY` is missing, `server/services/pinLogin.js:326-330` returns "Auth is not configured."

No PIN values were found in logs. Logs include username/email-ish diagnostics and token grant rejection text, which should be kept generic in production.

Recommended login fixes:

- Add `auth_user_id` to member profile records and use it in login repair.
- Enforce unique normalized username.
- Detect duplicate usernames and return an admin-repair error internally.
- Add a repair script to link `auth.users`, `app_users`, and `app_member_profiles` by verified email/phone.
- Add integration tests for:
  - username only in member profile
  - username only in auth metadata
  - legacy member with email in `user_key`
  - duplicate username
  - missing anon key
  - Supabase password grant reject

## Signup and Canonical Signup Route

What is good:

- Canonical signup route is `/love/sign`; aliases `/signup`, `/join`, and `/register` redirect to it.
- There is no separate rogue "Step 1 of 3" signup flow found in `src`, `server`, `api`, or `public`.
- Client validates username, phone, email, disposable email, PIN strength, legal acceptance, and math answer.
- Server independently validates disposable email, legal acceptance, math challenge, and identity availability before sending OTP.
- Signup verify creates/updates Supabase auth user, creates/updates member profile stub, mints a session, and routes based on onboarding completion.

Important files:

- `src/constants/routes.ts:6-49`
- `src/pages/AuthPage.tsx:477-690`
- `server/services/signupOtp.js:157-186`
- `server/services/signupOtp.js:548-618`
- `server/services/signupIdentity.js:209-260`
- `server/services/signupMathChallenge.js:1-49`

Findings:

- The visible signup headline is still `"Create your account"` at `src/pages/AuthPage.tsx:881`. This is not a duplicate flow by itself, but if new copy was expected, it has not been updated.
- The math challenge is in memory and fragile in multi-instance production.
- Challenge token is deleted on any attempt. This is acceptable for anti-abuse but can frustrate users if retries or network duplication occur.

Recommended signup fixes:

- Move math challenge state to a shared store or stateless signed token.
- Add server tests for alias redirect/canonical route and math challenge failure modes.
- Keep one signup form only; update text in the canonical component rather than adding another page.

## Onboarding, Home Routing, and Public vs Member Shell

What is good:

- Public homepage does not block on member restore.
- Member routes are guarded.
- Onboarding completion status is strict and avoids treating template defaults as real profile data.
- Server repair can mark older complete profiles as complete if enough data exists.

Important files:

- `src/App.tsx:185-228`
- `src/App.tsx:407-460`
- `src/App.tsx:757-790`
- `src/App.tsx:940-1025`
- `src/components/MemberRouteGuard.tsx:28-60`
- `src/services/goToApp.ts:11-87`
- `src/services/memberData.ts:105-153`
- `src/services/memberData.ts:233-370`
- `src/utils/onboardingStatus.ts:34-166`
- `server/services/onboardingRepair.js:146-191`
- `server/memberSocial.js:565-601`
- `server/memberSocial.js:696-783`

Findings:

- `MemberRouteGuard` intentionally redirects `/home` to `/onboarding` when `profileComplete === false`.
- Public `/` starts nonblocking, but background session restore still runs at `src/App.tsx:961-969`. This can change header/Open App state on the public homepage. That is intentional, but it can feel like public and member shells are mixed.
- `goToApp` timeout defaults to home after 2 seconds, which can mask repair failures or slow member data fetches.

Exact likely root cause for "home shows onboarding Step 1":

The app is not rendering Step 1 on a completed profile. It is classifying the member as incomplete. The most likely causes are:

- Login identity resolves to an incomplete duplicate member stub.
- Completed profile exists under a different email/phone/user key than the current Supabase session identity.
- `fetchOnboardingStatus` resolves email/phone before username and stops at the wrong member row.
- `goToApp` times out as home, then later guard/status sends user to onboarding.

Recommended routing fixes:

- Use `auth_user_id` and `loginEmail` through `goToApp` and `bootstrapMemberSession`.
- Prefer completed profile when multiple records match a login identity.
- Make timeout an explicit loading/error state, not home.
- Add a member identity diagnostic endpoint for support: input username/email/phone -> matching auth user, app user, member profiles, completion flags, and chosen route.

## Payments, Paystack, Activation, and Purchase Emails

What is good:

- Server verifies transactions with Paystack rather than trusting client state.
- Server checks email mismatch.
- Server uses Paystack metadata product type before request body.
- Purchase emails are idempotent through payment event records.
- Premium, boost, and quickie verification branches exist in `api/paystack/verify.js`.

Important files:

- `src/services/payments.ts:80-133`
- `src/services/payments.ts:205-241`
- `src/services/payments.ts:243-329`
- `src/services/payments.ts:331-421`
- `src/services/payments.ts:423-498`
- `src/utils/paymentReturn.ts:15-89`
- `src/utils/paymentState.ts:107-170`
- `src/App.tsx:792-826`
- `api/paystack/verify.js:323-520`
- `api/webhooks/paystack.js:1-96`
- `server/services/purchaseEmail.js`
- `server/services/paymentEvents.js`

Findings:

- Client callback product kind defaults to premium if `localStorage.paymentKind` is missing.
- Return path defaults to `/home`.
- Payment return metadata is local-only.
- `beginPaymentSession()` clears reference/kind/boost id but does not clear return context; a failed initialize can leave stale return path/product metadata until a later successful `savePaymentReturnContext`.
- Server callback verification is more reliable than client branching because it reads Paystack metadata.
- Webhook recovery is premium-only.

Purchase email status:

- `api/paystack/verify.js` calls purchase email notification for premium, boost, and quickie after successful verification.
- `api/webhooks/paystack.js` sends purchase email only when product type is premium or missing.
- `server/services/purchaseEmail.js` uses idempotent checks to avoid duplicate confirmation email for a reference.

Recommended payment fixes:

- Add server-side payment intent/return-context table keyed by Paystack reference.
- Include product type and return path in signed callback state where possible.
- After callback, client should ask server what product was verified and where to return.
- Extend webhook activation and purchase email for boost/quickie.
- Add tests for fresh tab callback, Android WebView callback, cancelled callback, failed callback, duplicate callback, and missing localStorage callback.

## Photo Upload, Moderation, and Review

What is good:

- Photo grid supports multiple uploads, optimistic pending tiles, retry, main photo selection, and remove.
- Client validates and compresses before upload.
- API requires a Supabase bearer token.
- API verifies storage config and user ownership before delete.
- Default moderation mode is upload-first/pending-review rather than hard rejection.
- Admin review can hide/remove rejected photos from public view.

Important files:

- `src/components/PhotoUploadGrid.tsx:89-168`
- `src/utils/profilePhotoUpload.ts:18-64`
- `src/services/profilePhotos.ts:26-43`
- `src/services/profilePhotos.ts:58-134`
- `api/member/photos.js:16-63`
- `api/member/photos.js:83-209`
- `server/services/photoModerationProvider.js:17-48`
- `server/services/photoReview.js:73-160`

Findings:

- Production has no emergency data URL fallback when storage is unavailable.
- `PHOTO_MODERATION_MODE=strict` can delete and reject uploaded photos, blocking profile completion.
- Duplicate photo detection compares a temporary data URL against existing remote URLs, so it will not reliably catch already-uploaded duplicates.

Recommended photo fixes:

- Keep production in upload-first mode.
- Add boot health check for storage config.
- Make upload failures visible with exact non-secret reason: auth expired, storage unavailable, payload invalid, moderation pending, moderation rejected.
- Add hash-based duplicate detection if duplicate prevention matters.

## Cache, Service Worker, and Crash Recovery

What is good:

- Service worker uses a cache name tied to build info.
- Navigations and HTML use network-only behavior.
- API requests are not intercepted by service worker.
- Build mismatch reloads once and clears volatile cache.
- Chunk load errors trigger recovery.
- Crash recovery preserves auth/profile/photos/preferences.

Important files:

- `src/main.tsx:34-40`
- `src/utils/serviceWorker.ts:24-49`
- `src/utils/serviceWorker.ts:86-118`
- `public/sw.js:1-92`
- `scripts/sync-cache-version.mjs:15-33`
- `src/utils/crashRecovery.ts:75-96`
- `src/utils/crashRecovery.ts:183-208`
- `src/components/AppErrorBoundary.tsx:29-42`
- `src/components/RouteErrorBoundary.tsx:21-39`

Findings:

- Service worker strategy is generally sound for web.
- Android packaged service worker is stale, which defeats the strategy inside packaged app assets.
- App-wide safe mode only triggers after the second crash within 60 seconds.
- Route-level boundary retry does not clear corrupt route data; it only resets boundary state.

Recommended cache/crash fixes:

- Add release freshness verification for Android assets.
- Add a visible "clear route data and retry" path for repeated route boundary crashes.
- Add crash metadata upload if a privacy-safe endpoint exists.

## Android and AAB Readiness

What is good:

- `scripts/build-android-release.mjs` is a strong one-command release path.
- It checks required Supabase env.
- It checks `android/key.properties`.
- It bumps version/build info, cleans `dist`, cleans Android build output, removes packaged public assets, runs web build, syncs Capacitor, builds APK/AAB, and copies release artifacts.

Important files:

- `capacitor.config.ts:5-14`
- `android/app/build.gradle:12-50`
- `scripts/build-android-release.mjs:22-39`
- `scripts/build-android-release.mjs:97-107`
- `scripts/build-android-release.mjs:165-181`
- `scripts/build-android-release.mjs:183-205`

Current artifacts:

- `play-store/releases/bamsignal-v1.0.13-16.aab`
- `play-store/releases/bamsignal-v1.0.13-16.apk`
- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`

Blocking issue:

Existing packaged Android assets are stale compared with current `dist`. Do not upload the current AAB unless it was generated after a clean `npm run android:release` and verified by asset parity checks.

Recommended Android release gate:

1. Clean `dist`, `android/app/build`, and `android/app/src/main/assets/public`.
2. Run `npm run android:release`.
3. Compare:
   - `src/buildInfo.ts` cache version
   - `public/sw.js` cache name
   - `dist/index.html` build meta
   - `android/app/src/main/assets/public/index.html` build meta
   - `dist/sw.js` cache name
   - `android/app/src/main/assets/public/sw.js` cache name
4. Fail release if any mismatch.
5. Install APK on device and test login, signup OTP, onboarding complete member restore, payment callback, and photo upload.

## Admin Console and Security

What is good:

- Admin hard session uses separate local storage keys from member session.
- Member session is snapshotted/restored around hard login/logout.
- Admin pages run through `AdminShell` and server API uses `requireAdmin`.
- Destructive actions like purge and reset PIN require extra admin consent.

Important files:

- `src/utils/adminSession.ts:8-25`
- `src/utils/adminSession.ts:243-272`
- `src/services/plans.ts:112-129`
- `src/pages/AdminAuthPage.tsx:72-103`
- `src/components/admin/AdminShell.tsx:30-40`
- `server/adminAuth.js:26-33`
- `server/adminConsent.js:89-113`
- `api/admin/members.js:31-53`
- `api/admin/members.js:112-129`

Findings:

- Local hard session can short-circuit server verification through `verifyAdminSession`.
- `server/adminAuth.js:28-29` allows `CRON_SECRET` via header, query string, or body. Query-string secrets are more likely to leak through logs and browser history.
- `server/adminConsent.js:9-10` falls back from `ADMIN_CONSENT_SECRET` to `CRON_SECRET` to `PAYSTACK_SECRET_KEY`, coupling unrelated secret scopes.

Recommended admin/security fixes:

- Make `verifyAdminSession(token)` always call server.
- Accept `CRON_SECRET` only from an auth header for admin endpoints.
- Require dedicated `ADMIN_CONSENT_SECRET` in production.
- Add tests for revoked admin, expired hard session, missing token, member token, non-admin token, consent required, and destructive action consent success.

## Secrets and Tracked Files

Files checked without reading secret contents:

- Tracked: `.env.example`
- Tracked: `android/key.properties.example`
- Tracked: `android/app/google-services.json`
- Ignored: `.env`
- Ignored: `.env.local`
- Ignored: `.vercel/.env.production.local`
- Ignored: `android/key.properties`

Findings:

- The real local env/key files are ignored, which is correct.
- `android/app/google-services.json` is tracked. This is normal for many Firebase Android apps, but it should still be reviewed for project identifiers, API key exposure policy, and Play/App Check restrictions.

No secret values were included in this report.

## Dependency Audit

Command result:

- `npm audit --audit-level=high` exited 1.
- 21 vulnerabilities were reported: 2 low, 12 moderate, 7 high.

High-severity areas:

- `@grpc/grpc-js`
- `axios`
- `fast-xml-builder`
- `form-data`
- `protobufjs`
- `ws`

Recommended dependency path:

1. Run non-breaking `npm audit fix` in a dedicated branch.
2. Re-run `npm audit --audit-level=high`.
3. Manually assess breaking updates, especially Vite and Firebase Admin.
4. Re-run server import smoke, build, SEO validation, and Android release build after dependency changes.

## Recommended Fix Order

1. **P0 Android release gate:** make AAB/APK impossible to build from stale `android/app/src/main/assets/public`.
2. **P0 admin validation:** remove local-session short-circuit from `verifyAdminSession`.
3. **P0 payment return source of truth:** recover product type/return path from server by reference; extend webhook recovery for boost/quickie.
4. **P1 login/member identity repair:** enforce unique username and link auth user/app user/member profile by stable auth user id.
5. **P1 onboarding status repair:** prefer completed profile over duplicate stub; pass resolved login email/auth id into bootstrap/status.
6. **P1 goToApp timeout:** return explicit timeout/loading error, not home.
7. **P1 server entrypoint:** consolidate `server/index.js` and `server/production.js` API mounts.
8. **P1 signup math storage:** move challenge state out of process memory.
9. **P1 photo launch health:** verify storage and upload-first moderation in production env.
10. **P1 dependencies:** update vulnerable runtime dependencies and re-run verification.
11. **P2 crash route recovery:** add route-data clearing for repeated route boundary crashes.
12. **P2 copy/content cleanup:** update signup copy if "Create your account" is no longer desired.

## First Cursor Task

Paste this as the first implementation task:

```text
Fix BamSignal Android release freshness and make stale AAB/APK impossible to ship.

Context:
- src/buildInfo.ts and public/sw.js currently use CACHE_VERSION bamsignal-v1.0.13-16-mqlke9yf.
- dist/index.html uses meta bamsignal-v1.0.13-16-mqlke9yf and assets index-Bg1CsT8z.js / index-D5LefkMj.css.
- android/app/src/main/assets/public/sw.js still uses bamsignal-v1.0.13-16-mqli2bje.
- android/app/src/main/assets/public/index.html has stale build meta/assets.

Task:
1. Add a script that verifies parity between dist and android/app/src/main/assets/public:
   - build meta in index.html matches
   - service worker cache name matches
   - JS/CSS asset references in index.html match existing packaged files
2. Wire it into npm run android:release after npx cap sync android and before Gradle bundleRelease.
3. Fail with a clear error if parity is wrong.
4. Add a package script for running the check manually.
5. Do not change app behavior in this task.
```

Why this first:

If the Play artifact can ship stale web assets, every login/payment/onboarding fix can still appear broken on Android. This is the release gate that protects all later work.

## Exact Commands Run

Non-mutating verification commands run:

```bash
sed -n '1,240p' /Users/stanlex/.codex/attachments/e1ec1659-bc6d-445f-8126-739e354e61f2/pasted-text.txt
git status --short
git ls-files .env .env.local .vercel/.env.production.local android/key.properties android/app/google-services.json .env.example android/key.properties.example
git check-ignore -v .env .env.local .vercel/.env.production.local android/key.properties android/app/google-services.json
npm run test:server-import
npm audit --audit-level=high
```

Key source inspection commands run:

```bash
rg --files
rg -n "pin-login|loginWithPassword|resolveLoginAccount|verifyLoginPassword|Invalid username|Auth is not configured" src server api
rg -n "AUTH_SIGNUP_PATH|AUTH_SIGNUP_ALIASES|Create your account|Step 1 of 3|Verify your email" src server api public
rg -n "goToApp|bootstrapMemberSession|profileComplete|MemberRouteGuard|onboarding-status|repairMemberOnboarding" src server api
rg -n "Paystack|paymentReturn|paymentKind|completePendingPayment|purchaseEmail|webhooks/paystack" src server api
rg -n "PhotoUploadGrid|uploadCompressedProfileBlob|PHOTO_MODERATION_MODE|photoReview|moderationRejected" src server api shared
rg -n "serviceWorker|CACHE_NAME|CACHE_VERSION|buildInfo|sync-cache-version|crashRecovery|AppErrorBoundary" src public scripts
rg -n "adminSession|verifyAdminSession|requireAdmin|requireAdminConsent|CRON_SECRET|ADMIN_CONSENT_SECRET" src server api
rg -n "bamsignal-build|assets/index" dist/index.html android/app/src/main/assets/public/index.html
find play-store/releases -maxdepth 2 -type f | sort
find android/app/build/outputs -maxdepth 4 -type f | sort
```

Representative file/line inspection commands run:

```bash
nl -ba package.json | sed -n '1,120p'
nl -ba src/pages/AuthPage.tsx | sed -n '420,690p'
nl -ba src/services/authEmail.ts | sed -n '260,305p'
nl -ba server/services/loginResolve.js | sed -n '1,230p'
nl -ba server/services/pinLogin.js | sed -n '320,710p'
nl -ba src/App.tsx | sed -n '180,235p'
nl -ba src/App.tsx | sed -n '400,460p'
nl -ba src/App.tsx | sed -n '750,835p'
nl -ba src/App.tsx | sed -n '940,1025p'
nl -ba src/components/MemberRouteGuard.tsx | sed -n '1,90p'
nl -ba src/services/goToApp.ts | sed -n '1,120p'
nl -ba src/services/memberData.ts | sed -n '100,165p'
nl -ba src/services/memberData.ts | sed -n '230,370p'
nl -ba src/utils/onboardingStatus.ts | sed -n '1,170p'
nl -ba server/services/onboardingRepair.js | sed -n '1,240p'
nl -ba src/services/payments.ts | sed -n '70,540p'
nl -ba src/utils/paymentReturn.ts | sed -n '1,120p'
nl -ba src/utils/paymentState.ts | sed -n '90,170p'
nl -ba api/paystack/verify.js | sed -n '300,520p'
nl -ba api/webhooks/paystack.js | sed -n '1,220p'
nl -ba src/components/PhotoUploadGrid.tsx | sed -n '1,240p'
nl -ba src/utils/profilePhotoUpload.ts | sed -n '1,210p'
nl -ba src/services/profilePhotos.ts | sed -n '1,220p'
nl -ba api/member/photos.js | sed -n '1,240p'
nl -ba server/services/photoModerationProvider.js | sed -n '1,180p'
nl -ba src/utils/serviceWorker.ts | sed -n '1,230p'
nl -ba public/sw.js | sed -n '1,160p'
nl -ba scripts/sync-cache-version.mjs | sed -n '1,180p'
nl -ba scripts/build-android-release.mjs | sed -n '1,240p'
nl -ba android/app/build.gradle | sed -n '1,150p'
nl -ba capacitor.config.ts | sed -n '1,80p'
nl -ba src/utils/adminSession.ts | sed -n '1,310p'
nl -ba src/services/plans.ts | sed -n '75,145p'
nl -ba server/adminAuth.js | sed -n '1,180p'
nl -ba server/adminConsent.js | sed -n '1,180p'
nl -ba src/utils/crashRecovery.ts | sed -n '1,240p'
nl -ba src/components/AppErrorBoundary.tsx | sed -n '1,170p'
nl -ba server/index.js | sed -n '1,160p'
nl -ba server/production.js | sed -n '1,220p'
```

Commands intentionally not run because this was an audit-only request:

```bash
npm run build
npm run seo:validate
```

Reason:

- `npm run build` runs `scripts/sync-cache-version.mjs`, which writes `src/buildInfo.ts` and `public/sw.js`.
- `npm run seo:validate` runs generation/validation steps that may rewrite generated SEO artifacts.
- The user request explicitly prohibited code changes during the audit. Running those commands would have risked changing files outside this report.

## Verification Results

`npm run test:server-import`:

- Exit code: 0.
- Result: `server ok`.
- Warnings observed:
  - `DATABASE_URL is not set. Database-backed features will run in dry-run mode.`
  - `PAYSTACK_SECRET_KEY is not set. Payment endpoints will return service-unavailable errors.`
  - Signup email trace showed no service role key in the local smoke environment.

`npm audit --audit-level=high`:

- Exit code: 1.
- Result: 21 vulnerabilities, including 7 high.

Git worktree before writing this report already had unrelated modified/untracked files. They were left untouched.

## Launch Readiness Score

Score: **61/100**

Breakdown:

- Login/auth reliability: 6/10
- Signup correctness: 8/10
- Onboarding/member routing: 6/10
- Payments/activation: 5/10
- Purchase emails: 7/10
- Photo upload/moderation: 7/10
- Cache/service worker: 7/10 web, 3/10 Android packaged state
- Android release readiness: 4/10
- Admin/security: 5/10
- Dependency/security hygiene: 5/10

Release recommendation:

Do not submit the current Android release artifact to Google Play production. Fix Android asset freshness, payment return recovery, admin validation, and member identity/onboarding repair first. Then run a clean release build and test on a real Android device before upload.
