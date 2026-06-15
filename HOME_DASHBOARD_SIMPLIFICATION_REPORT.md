# Home Dashboard Simplification Report

**Date:** 2026-06-15  
**Sprint:** Member home declutter  
**Status:** Complete — production build passes

---

## Summary

The member Home screen was reduced from a dense “control center” layout to five calm blocks: greeting, discover CTA, optional activity, optional verification, optional premium. Removed onboarding homework, usage meters, referrals, and profile-gamification from the home tab.

---

## Sections removed from Home

| Removed UI | Former component |
|------------|------------------|
| Welcome to BamSignal / first-day journey checklist | `FirstDayJourneyCard` |
| Profile complete · First signal · First connection steps | `FirstDayJourneyCard` |
| Today's Access (swipes / messages counters) | `DashboardDailyLimits` |
| Invite friends · referral code · share link | `ReferralCard` / `DashboardConnectionPrompt` |
| Profile Strength % and field checklist | `DashboardProfileStrengthCard` |
| Next steps chips (profile %, verify, voice, upgrade) | `DashboardNextSteps` |
| Momentum bar (views, nearby, streak hints) | `DashboardMomentumBar` |
| Emoji activity feed | `DashboardActivityFeed` |
| Value strip (emoji copy) | `DashboardValueStrip` |
| Streak banner | `StreakBanner` |
| Nearby signals preview grid | `DashboardNearbySignals` |
| Safety Center promo card | Inline `dash-safety-link` |
| Verified profile badge card (when verified) | Inline `dash-verified` |
| Busy greeting subline (streak · nearby · views) | `dash-greeting p` |

**Note:** Referral backend and `ENABLE_REFERRALS_UI` flag are unchanged — UI simply no longer mounts on Home.

---

## Components no longer used on Home

These files remain in the repo (admin/other flows may reference patterns) but are **not imported** by `HomePage.tsx`:

- `FirstDayJourneyCard.tsx`
- `DashboardDailyLimits.tsx`
- `DashboardProfileStrengthCard.tsx`
- `DashboardNextSteps.tsx`
- `DashboardMomentumBar.tsx`
- `DashboardActivityFeed.tsx`
- `DashboardValueStrip.tsx`
- `StreakBanner.tsx`
- `DashboardNearbySignals.tsx`
- `DashboardConnectionPrompt.tsx`
- `ReferralCard.tsx` (still gated by feature flag elsewhere if re-enabled)
- `ProfileViewsSheet.tsx` (removed from Home; visitors flow via other tabs/overlays)

---

## New hierarchy

```
Greeting
  ↓
Discover CTA (primary focus)
  ↓
Your Activity (hidden if all metrics are zero)
  ↓
Verification (only if not verified)
  ↓
Signal Pass (only if not premium)
```

### Copy updates

| Element | Copy |
|---------|------|
| Discover card | **Discover People Nearby** · Meet people who match your vibe. · **Open Discover** |
| Activity | **Your Activity** — Profile views · Signals received · Connections started |
| Verification | **Verification** — compact row, **Verify** button |
| Premium | **Signal Pass** — one line + **View plans** |

Removed emoji-heavy labels (🔥 ✨ 👀 ❤️ 📤) from the home activity area.

Premium pill for subscribers reads **Signal Pass** (or trial hours) instead of generic “Premium”.

---

## Files changed

| File | Change |
|------|--------|
| `src/pages/HomePage.tsx` | Rewritten — minimal composition |
| `src/components/dashboard/DashboardDiscoverCta.tsx` | New headline, lede, button |
| `src/components/dashboard/DashboardActivitySnapshot.tsx` | Clean list card; connections from matches; hide when empty |
| `src/styles/dashboard.css` | Calm spacing, activity card, subtle verify/premium rows |
| `src/App.tsx` | Trimmed `HomePage` props |

---

## Mobile improvements

- **Less scroll** — ~15 blocks reduced to 3–5 depending on user state
- **Larger tap target** — Discover remains full-width hero card
- **Compact secondary rows** — Verification and Signal Pass are horizontal single-line cards on mobile
- **No 4-column emoji grid** — activity uses a simple label / value list
- **Increased vertical rhythm** — `.home-dashboard--calm` uses 28px gap vs 22px

---

## Performance

| Metric | Before (approx.) | After |
|--------|------------------|-------|
| JS bundle (gzip) | ~87.3 KB | **~82.6 KB** |
| Modules transformed | 1818 | **1802** |

---

## Remaining recommendations

1. **Deploy** — push to `main` for Coolify.
2. **Limits UX** — show swipe/message limits only in Discover or Chats when the user hits the cap (existing logic elsewhere; confirm no regression).
3. **Profile completion** — keep strength meter on Profile tab only (`ProfileStrengthMeter` / edit flows).
4. **First-day journey** — `syncFirstDayFromProfile` still runs in app lifecycle if wired elsewhere; safe to leave backend storage until a dedicated cleanup sprint.
5. **Dead code** — optional follow-up to delete unused dashboard components after one release cycle.
6. **Activity taps** — optional: make “Profile views” open visitors sheet for premium users.

---

## Goal status

| Goal | Status |
|------|--------|
| Calm, premium feel | Yes |
| Less information density | Yes |
| Clear hierarchy | Yes — Discover first |
| No referral / checklist / meters on Home | Yes |
| Connection-focused | Yes |

The member Home should now feel closer to a fintech or premium social app — quiet, intentional, and oriented toward opening Discover.
