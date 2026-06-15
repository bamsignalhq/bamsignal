# Referral UI Removal Report

**Date:** June 15, 2026  
**Goal:** Cleaner member dashboard — less promotional noise, more focus on discovery and connections.  
**Scope:** User-facing UI only. Backend tracking, rewards, and admin visibility preserved.

---

## Summary

The referral invite widget is **hidden from all member-facing surfaces** via feature flag (`VITE_ENABLE_REFERRALS_UI=false`). The home dashboard slot previously occupied by referral stats is replaced with a connection-focused prompt (profile completion or Discover CTA). Referral tracking, server rewards, signup `?ref=` handling, and admin metrics remain intact for a future campaign launch.

---

## Feature flag

| Variable | Default | Constant |
|----------|---------|----------|
| `VITE_ENABLE_REFERRALS_UI` | `false` | `ENABLE_REFERRALS_UI` in `src/constants/featureFlags.ts` |

Set `VITE_ENABLE_REFERRALS_UI=true` in Coolify build args (or `.env.local` for dev) to re-enable the member referral card without code changes.

---

## Components removed from user view

| Component / surface | Action |
|---------------------|--------|
| `ReferralCard` on Home Dashboard | Gated behind `ENABLE_REFERRALS_UI` — not rendered when flag is `false` |
| Profile Page | No referral UI was present — no change |
| Main navigation (`BottomNav`, `MemberNav`) | No referral links — no change |
| Other dashboard cards | No other referral widgets found |

### Preserved for future use (not deleted)

- `src/components/dashboard/ReferralCard.tsx` — full invite widget (code, progress bar, stats, share)
- `src/styles/dashboard.css` — `.dash-referral*` styles retained for flag-on reactivation

---

## Replacement widget

**New:** `src/components/dashboard/DashboardConnectionPrompt.tsx`

| Profile strength | Shown content | CTA |
|------------------|---------------|-----|
| &lt; 100% | “Complete your profile” — improve visibility and compatibility | Edit Profile |
| 100% | “Discover more people” — expand connections | Explore Discover |

Rendered on **Home Dashboard** in the former referral slot when `ENABLE_REFERRALS_UI` is `false`.

---

## Areas cleaned up

| File | Change |
|------|--------|
| `src/pages/HomePage.tsx` | Conditional: `ReferralCard` vs `DashboardConnectionPrompt` |
| `src/constants/featureFlags.ts` | **New** — `ENABLE_REFERRALS_UI` |
| `src/components/dashboard/DashboardConnectionPrompt.tsx` | **New** — replacement CTA card |
| `src/styles/dashboard.css` | **New** — `.dash-connection*` styles |
| `.env.example` | Documented `VITE_ENABLE_REFERRALS_UI=false` |

---

## Backend preserved (unchanged)

### Server

- `server/memberSocial.js` — referral registration, `app_referral_events`, reward grants
- `server/db.js` — `referral_code`, `referral_points` columns

### Client services & utils

- `src/utils/referrals.ts` — local state, share URL, invite/success helpers
- `src/services/memberData.ts` — syncs referral bundle from API
- `src/App.tsx` — `trackEvent("referral_signup")` on signup with `?ref=` query param
- `src/utils/notifyHelpers.ts` — `notifyReferralRewardEarned()`
- `src/utils/notifications.ts` — `referral_reward` notification type
- `src/types/index.ts` — `referralCode` on user profile

### Analytics events (still tracked)

- `referral_signup`
- Referral reward notifications (server-driven)

---

## Admin visibility retained & expanded

### Existing (Business tab)

- Referral signups (launch metrics)
- Referral conversion % (retention section)

### New

| File | Purpose |
|------|---------|
| `src/components/admin/AdminReferralPanel.tsx` | Dedicated “Referral program” section on Admin → Business |
| `src/utils/referralAnalytics.ts` | Aggregates signup conversion + local referral state |

**Admin panel shows:**

- Referral signups (analytics)
- Conversion rate
- Successful referrals (local storage mirror)
- Rewards claimed (local)
- Invites sent (local)

Note: Local counters mirror client-side state; authoritative counts remain on the server (`app_referral_events`, user `referral_points`).

---

## What members no longer see

- Referral code display
- “Invite friends” / “Earn rewards” copy
- Progress toward Signal Pass (e.g. 0/3 referrals)
- Invite / Completed / Earned / Pending stat grid
- Share referral link button

---

## Re-enabling referrals (future)

1. Finalize reward structure and campaign creative.
2. Set `VITE_ENABLE_REFERRALS_UI=true` at build time.
3. Redeploy via Coolify.
4. Optionally remove or hide `DashboardConnectionPrompt` when flag is on (automatic — `ReferralCard` takes the slot).

---

## Verification

- [x] `npm run build` passes
- [x] Home dashboard shows connection prompt when flag is `false`
- [x] No referral UI on Profile or navigation
- [x] Admin Business tab includes referral metrics + dedicated panel
- [x] Backend referral routes and DB schema untouched

---

## Files touched (this sprint)

```
src/constants/featureFlags.ts                          (new)
src/components/dashboard/DashboardConnectionPrompt.tsx (new)
src/components/admin/AdminReferralPanel.tsx            (new)
src/utils/referralAnalytics.ts                         (new)
src/pages/HomePage.tsx                                 (modified)
src/components/admin/AdminBusinessDashboard.tsx        (modified)
src/styles/dashboard.css                               (modified)
.env.example                                           (modified)
REFERRAL_UI_REMOVAL_REPORT.md                          (new)
```
