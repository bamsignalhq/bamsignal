# Pre-Launch Validation Report

**Validated:** 2026-06-15T05:46:37Z (UTC)  
**Environment:** Production — https://bamsignal.com  
**Deployed commit:** `51c5e5f0dc397687a3da2f6eb54e0e07258f10f1`  
**Method:** Live HTTP requests to production API endpoints. No mocks. No assumptions.

---

## Executive Summary

| # | Check | Result |
|---|-------|--------|
| 1 | Production database connection | **FAIL** |
| 2 | Real cross-user Signals | **FAIL** |
| 3 | Real cross-user Matches | **FAIL** |
| 4 | Real message persistence | **FAIL** |
| 5 | Referral rewards | **FAIL** |
| 6 | Premium persistence | **FAIL** |
| 7 | Reports | **FAIL** |
| 8 | Blocking | **FAIL** |
| 9 | Verification flow | **FAIL** |
| 10 | Admin moderation | **FAIL** |

**Launch readiness: NOT READY** — 0 / 10 checks passed.

---

## 1. Production Database Connection — FAIL

**Test:** `GET https://bamsignal.com/health`

**Actual response (HTTP 200):**

```json
{
  "ok": true,
  "service": "bamsignal",
  "database": "dry-run",
  "paystack": true,
  "resend": true,
  "firebase": false,
  "telegram": false
}
```

**Expected:** `"database": "connected"`

**Result:** Database is in dry-run mode. `DATABASE_URL` is not set in the Coolify runtime environment. All database-backed member endpoints return HTTP 503.

---

## 2. Real Cross-User Signals — FAIL

**Test:** `POST /api/member/data?action=register` then `POST /api/member/data?action=signal`

**Request (User A → target profile):**

```json
{"email":"prelaunch-a@test.bamsignal.com","phone":"8011111111","targetProfileId":"00000000-0000-0000-0000-000000000001"}
```

**Actual response (HTTP 503):**

```json
{"ok":false,"error":"Database is not connected.","database":"dry-run"}
```

**Cross-user signal test:** Not possible. Registration, profile sync, discover, and signal endpoints all blocked by dry-run database. No signal was created; no incoming signal could be fetched for a second user.

---

## 3. Real Cross-User Matches — FAIL

**Test:** `POST /api/member/data?action=accept-signal`

**Request:**

```json
{"email":"prelaunch-b@test.bamsignal.com","phone":"8022222222","signalId":"00000000-0000-0000-0000-000000000001"}
```

**Actual response (HTTP 503):**

```json
{"ok":false,"error":"Database is not connected.","database":"dry-run"}
```

**Cross-user match test:** Not possible. Accept-signal requires a pending DB signal. No match rows were created for either user.

---

## 4. Real Message Persistence — FAIL

**Test:** `POST /api/member/data?action=message` then `POST /api/member/data?action=pull`

**Request:**

```json
{
  "email":"prelaunch-a@test.bamsignal.com",
  "phone":"8011111111",
  "threadId":"thread-test-1",
  "message":{"id":"msg1","text":"Hello from prelaunch test","from":"me","at":"2026-06-15T00:00:00Z"}
}
```

**Actual response (HTTP 503):**

```json
{"ok":false,"error":"Database is not connected.","database":"dry-run"}
```

**Pull test:** Also returned HTTP 503 with the same database error. No message was persisted or retrievable.

---

## 5. Referral Rewards — FAIL

**Tests:**
- `POST /api/member/data?action=register` with referral code
- `POST /api/member/data?action=referral`
- `POST /api/member/data?action=complete-onboarding`

**Actual response (all HTTP 503):**

```json
{"ok":false,"error":"Database is not connected.","database":"dry-run"}
```

**Referral reward test:** Not possible. No users registered, no referral events recorded, no premium extension applied.

---

## 6. Premium Persistence — FAIL

**Tests:**

| Endpoint | Result |
|----------|--------|
| `POST /api/member/data?action=status` | HTTP 503 — `"Database is not connected."` |
| `POST /api/paystack/verify` (no reference) | HTTP 400 — `{"ok":false,"error":"Payment reference is required."}` (endpoint live) |
| `POST /api/paystack/verify?action=initialize` | HTTP 502 — Cloudflare origin error (`error code: 502`) |
| `GET /health` → `paystack` | `true` (key configured) |

**Premium DB persistence test:** Not possible. Status endpoint blocked by dry-run. Paystack checkout initialize fails with HTTP 502 before a transaction can start. Premium activation (`activateAppUserPremium`) requires a connected database — not exercised.

---

## 7. Reports — FAIL

**Test:** `POST /api/member/data?action=report`

**Request:**

```json
{
  "email":"prelaunch-a@test.bamsignal.com",
  "phone":"8011111111",
  "report":{"profileId":"fake-profile-id","reason":"fake_profile","at":"2026-06-15T00:00:00Z"}
}
```

**Actual response (HTTP 503):**

```json
{"ok":false,"error":"Database is not connected.","database":"dry-run"}
```

**Report persistence test:** Not possible. Server-side `app_reports` table insert was not reached.

---

## 8. Blocking — FAIL

**Production API test:** No blocking endpoint exists on production. Searched all `/api/member/data` actions — no `block` action is implemented.

**Actual production behavior:** Blocking is handled client-side only (`blockUser()` in `src/utils/safety.ts` writes to `localStorage` key `bamsignal-blocked`). No server sync.

**Cross-user blocking test:** Not possible on production. User A blocking User B is not persisted server-side and would not affect User B's view of User A on a different device or browser.

---

## 9. Verification Flow — FAIL

**Production API test:** No verification endpoint exists on production. No server route for submit, approve, or reject.

**Actual production behavior:**
- User submits verification via `submitVerificationRequest()` → stored in browser `localStorage` (`bamsignal-verification-queue`)
- Admin approves via `approveVerification()` → updates same browser's `localStorage`
- User's `profile.verified` flag is set locally when `isUserVerificationApproved(phone)` matches on the same device

**Cross-user / cross-device verification test:** Not possible on production. Admin on one machine cannot see or approve a verification submitted by a user on another machine.

---

## 10. Admin Moderation — FAIL

**Tests:**

| Endpoint | Actual response |
|----------|-----------------|
| `POST /api/admin/city-home?action=members` (no auth) | HTTP 401 — `{"ok":false,"error":"Admin login required."}` |
| `POST /api/auth/identity?action=admin-session` (invalid token) | HTTP 401 — `{"ok":false,"error":"Admin login required."}` |

**Admin moderation queue test:** The Command center moderation UI reads reports from browser `localStorage` (`getModerationQueue()` in `src/utils/moderationQueue.ts`), not from the server `app_reports` table. Shadow bans are also `localStorage`-only (`src/utils/shadowBan.ts`).

**With valid admin credentials:** City-home admin API would still return HTTP 503 until database is connected (handler checks `getDatabaseStatus()` after auth).

**Cross-user admin moderation test:** Not possible. Reports submitted via API are blocked (503). Reports stored in DB would not appear in admin UI even if DB were connected, because the admin queue does not fetch from the server.

---

## Launch Blockers

### Critical (must fix before launch)

1. **`DATABASE_URL` not configured in Coolify**  
   Health shows `dry-run`. Blocks registration, discover, signals, matches, messages, referrals, premium status, and server-side reports. This single env gap causes failures on items 1–7.

2. **Paystack checkout initialize returns HTTP 502**  
   `POST /api/paystack/verify?action=initialize` fails at origin. Premium and boost purchases cannot start even after DB is fixed until this is resolved (likely Paystack API call failure from server — invalid key, network, or unhandled crash).

3. **Blocking is client-local only**  
   No server persistence. Real users on different devices will not be protected by blocks.

4. **Verification is client-local only**  
   Admin cannot approve real user verifications across devices. Verified badge does not sync to member profile in database on approval.

5. **Admin moderation reads localStorage, not database**  
   Server-side report persistence exists in code but admin UI does not consume it. Shadow bans are not enforced server-side.

### Required before real-user launch

| Blocker | Affected flows |
|---------|----------------|
| Set `DATABASE_URL` in Coolify + verify `/health` → `"connected"` | All social, messaging, referrals, premium status |
| Fix Paystack initialize 502 | Premium purchases, boost purchases |
| Server-side block list (or accept launch without cross-device blocking) | Safety |
| Server-side verification queue + admin API | Trust / verified badge |
| Admin moderation wired to `app_reports` table | Safety ops |

---

## Test Log

All requests run against https://bamsignal.com on 2026-06-15 between 05:39–05:46 UTC.

```
GET  /health                                          → 200  database:dry-run
POST /api/member/data?action=register                 → 503  Database is not connected.
POST /api/member/data?action=discover                 → 503  Database is not connected.
POST /api/member/data?action=signal                   → 503  Database is not connected.
POST /api/member/data?action=incoming                   → 503  Database is not connected.
POST /api/member/data?action=accept-signal             → 503  Database is not connected.
POST /api/member/data?action=message                   → 503  Database is not connected.
POST /api/member/data?action=pull                       → 503  Database is not connected.
POST /api/member/data?action=referral                   → 503  Database is not connected.
POST /api/member/data?action=complete-onboarding        → 503  Database is not connected.
POST /api/member/data?action=status                     → 503  Database is not connected.
POST /api/member/data?action=report                     → 503  Database is not connected.
POST /api/paystack/verify                               → 400  Payment reference is required.
POST /api/paystack/verify?action=initialize             → 502  error code: 502 (Cloudflare)
POST /api/admin/city-home?action=members                → 401  Admin login required.
POST /api/auth/identity?action=admin-session            → 401  Admin login required.
POST /api/auth/identity?action=pricing                  → 200  plans returned (unaffected by DB)
```

---

*No new features. No redesign. Validation only.*
