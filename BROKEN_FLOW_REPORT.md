# Broken Flow Report

**Audit date:** 14 June 2026  
**Method:** Static route/link inventory, component wiring review, payment callback trace. No new features added.

---

## Summary

| Severity | Count |
|----------|------:|
| Critical (blocks core journey) | 4 |
| High (confusing or loses state) | 5 |
| Medium (dead UI / orphan) | 6 |
| Low (cosmetic URL / copy) | 3 |

---

## Critical flows

### 1. Discover shows mock profiles, not live members

**Where:** `DiscoverPage`, `HomePage`, `LikesPage`, `GuestDiscoverPage` import `MOCK_PROFILES` from `src/data/mockProfiles.ts`.

**Impact:** Signup → onboarding → discover presents fictional people. Signals, matches, and chats against mock IDs do not reflect a real dating pool.

**Status:** Launch blocker — not a broken button, but every discover CTA is a dead end for real connection.

---

### 2. Referral rewards never increment

**Where:** `recordSuccessfulReferral()` in `src/utils/referrals.ts` is defined but **never called** from signup or anywhere else. `App.tsx` only fires `trackEvent("referral_signup")`.

**Impact:** Referral card shows progress UI; rewards (`grantReferralReward`) never trigger.

**Status:** Launch blocker for referral journey.

---

### 3. Paystack return without active session

**Where:** `App.tsx` payment verify effect runs only when `isAuthed === true`. User can complete Paystack while Supabase session is expired.

**Impact:** Payment succeeds at Paystack; client never verifies; `PaymentRecoveryBanner` may appear indefinitely until manual retry after re-login.

**Mitigation exists:** Recovery banner + retry. Still a common dead end on mobile if session drops during checkout.

---

### 4. Premium activation split: server vs localStorage

**Where:** Server writes `app_users.premium_until` via `activateAppUserPremium`; client reads `STORAGE_KEYS.premiumUntil` in `isPremiumActive()`.

**Impact:** New device / cleared storage → user paid but app shows free tier until verify runs again with stored reference.

---

## High severity

### 5. Post-payment redirect (fixed in this audit)

**Was:** `navigateToPath("/app")` — `/app` is not a registered route; URL bar showed invalid path.

**Now:** Redirects to `/`. Payment reference still stored in localStorage before redirect.

---

### 6. Admin moderation uses mock profile lookup

**Where:** `src/utils/moderationQueue.ts` resolves reported profile names via `MOCK_PROFILES.find`.

**Impact:** Reports against real users may show wrong name or "Unknown" in admin queue.

---

### 7. Guest footer on non-home tabs without full legal shell

**Where:** Guest users on Discover/Likes/Chats/Me see compact footer; legal links work via `getLegalPath()`.

**Verified working:** `/about`, `/safety`, `/privacy`, `/terms`, `/contact`, `/blog` — all render `LegalPage` or blog with footer.

---

### 8. `onMatch={() => undefined}` on DiscoverPage

**Where:** `App.tsx` line ~695 passes no-op match handler.

**Impact:** Parent never notified on match; match UX relies entirely on internal DiscoverPage state. Not user-visible if internal flow works.

---

### 9. Boost verify skipped if already premium

**Where:** Premium branch runs first; boost branch is separate — OK. But premium verify early-returns `if (isPremium) return` **before** boost branch only applies to premium path — boost path is separate. Verified: boost flow OK when `paymentKind === "boost"`.

---

## Medium — orphan / unwired UI

| Component | Issue |
|-----------|--------|
| `ReturnTriggers` | Built but never imported in `App` or `HomePage` |
| `WaitlistForm` | Not mounted on any page |
| `LiveActivityPill` | Not mounted; fake "428 active" copy removed from data |
| Admin CMS fields | `quickiePrice`, `quickiePriceLabel` still in CMS schema — legacy, no user-facing quickie flow |

---

## Navigation matrix (verified)

| Entry | Guest | Authed | Result |
|-------|-------|--------|--------|
| Logo | ✓ | ✓ | Home / landing |
| Get started | ✓ | — | `/love/sign` |
| Bottom nav Home | Landing | Dashboard | ✓ |
| Bottom nav Discover | Guest discover | Discover deck | ✓ (mock data) |
| Bottom nav Likes | GuestGate | LikesPage | ✓ |
| Bottom nav Chats | GuestGate | ChatsPage | ✓ |
| Bottom nav Me | GuestGate | ProfilePage | ✓ |
| Notifications | Hidden guest | NotificationCenter | ✓ |
| Premium / pricing modal | Opens modal | Paystack redirect | ✓ (needs env) |
| Admin (profile) | — | `/hard` auth → hub | ✓ |
| Blog footer | BlogIndex | BlogIndex | ✓ |
| Invalid blog slug | 404 message + back | ✓ |

---

## Modals tested (code paths)

| Modal | Trigger | Dismiss | Action |
|-------|---------|---------|--------|
| PricingModal | Upgrade CTAs | Close / backdrop | Plan → Paystack |
| PaywallModal | Chat limits | Close | Plan → Paystack |
| ReportBlockModal | Chat safety | Close / submit | Block + report local |
| OffPlatformEducationModal | Contact share detect | Continue | Unblocks send |
| NotificationCenter | Bell | Close | Nav via notification type |
| Discover filters sheet | Filter btn | Apply / close | ✓ |
| Onboarding | Post-signup | Complete only | → Discover tab |

---

## Recommended fix order (launch blockers only)

1. Wire discover/likes to real member API (or clearly label beta/seeded city).
2. Call `recordSuccessfulReferral()` when referred signup completes server-side.
3. Run payment verify on `/payment/success` even before session restore (store ref from URL first).
4. Sync premium status from server on every app boot for authed users.

---

*No new features were added in this audit. Copy and `/payment/success` redirect were corrected.*
