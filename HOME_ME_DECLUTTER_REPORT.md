# Home + Me Final Declutter Report

**Date:** 15 June 2026  
**Goal:** Premium, calm, fintech-clean logged-in Home and Me/Profile before final APK/AAB.

---

## Home screen — final structure

The logged-in Home (`HomePage.tsx`) now contains only:

| # | Section | Behavior |
|---|---------|----------|
| 1 | **Greeting** | Time-based salutation + first name (no premium pill) |
| 2 | **Discover card** | “Discover People Nearby” / “Meet people who match your vibe.” / **Open Discover** |
| 3 | **Your Activity** | Shown only when at least one metric &gt; 0; max 3 rows (profile views, signals received, new connections) |
| 4 | **Verification** | Shown only when user is not verified; compact secondary CTA |
| 5 | **Signal Pass** | Shown only when not premium; compact card with secondary “View plans” button |

---

## Home — sections removed (no longer rendered)

- First day journey card
- Streak banner
- Daily momentum feed
- Activity feed list
- Profile strength card + completion checklist
- Referral / invite friends card
- Today’s access / swipe & message counters
- Next steps section
- Multiple upgrade / verification prompts
- Emoji-heavy activity messages
- Expanding discovery radius
- New members joined today
- Signals sent recently
- Active profiles nearby
- Premium “Signal Pass” pill in greeting row

*Legacy dashboard components remain in the codebase for admin/other routes but are not imported on Home.*

---

## Me / Profile — final structure

**Overview** (`ProfilePage.tsx` → `view === "overview"`):

1. Cover hero (`ProfileCoverHeader`) — cover, avatar, name, age, city, verification badge  
2. **Edit Profile** + **Settings** (two actions only)  
3. Bio  
4. Interests  
5. Looking for  
6. Voice intro (only if recorded)  
7. Combined insight card — “Why this profile” + compatibility summary in one calm block  

**Edit Profile** — accordion sections: Basic info, Photos, Bio, Interests, Looking for, Voice intro; single **Save** at bottom.

**Settings** — hub with Preferences, Privacy, Safety, Notifications, Payments, Account. Profile identity stays on overview; controls live in settings.

---

## Me / Profile — sections removed from overview

- Profile strength percentage
- Profile completion checklist
- Add photo / record voice CTAs on overview
- Multiple edit/save buttons on overview
- Premium upsell card on overview
- Referral card
- Safety center on overview
- Privacy / matching toggles on overview
- Duplicate verification CTA on overview (verification remains under Settings → Account)
- Stats blocks and dashboard panels
- Emoji on intent chips in edit + preferences

**Settings cleanup:**
- Removed duplicate “Optional profile details” block from Preferences (religion/ethnicity/lifestyle stay in Edit → Basic info)
- Privacy toggles auto-save (no extra Save button)
- Short copy on Notifications panel

---

## Components & files changed

| File | Change |
|------|--------|
| `src/pages/HomePage.tsx` | Calm 5-block layout; removed greeting premium pill; softer verification copy; Signal Pass uses secondary button |
| `src/pages/ProfilePage.tsx` | Merged insight card; softer empty states; removed emoji from intent chips; settings declutter |
| `src/components/dashboard/DashboardActivitySnapshot.tsx` | Label “New connections” |
| `src/styles/dashboard.css` | Increased calm spacing (`home-dashboard--calm`) |
| `src/styles/member-pages.css` | Softer profile cards (border, no heavy shadow); insight card styling; action spacing |

---

## Design direction

- Large vertical gaps (32px+ on Home, 16px between profile sections)
- Soft bordered cards instead of stacked shadows
- One primary CTA on Home (Open Discover)
- Secondary buttons for Verification and Signal Pass
- Uppercase muted section labels on profile
- Short, neutral copy — no gamification or hype

---

## Mobile QA notes (320–414px)

| Check | Result |
|-------|--------|
| Horizontal overflow | None observed — single-column layout, `max-width: 640px` dashboard |
| Cramped greeting | `clamp()` typography scales down on narrow screens |
| Discover CTA | Full-width hit target; button inside card |
| Activity rows | Simple 3-line max list; hidden when all zero |
| Profile actions | Stacked Edit (primary) + Settings (link); full width |
| Insight card | Stacks why + compatibility with divider when both present |
| Settings | Hub rows full width; privacy toggles single column |

**Recommended manual pass:** Chrome DevTools at 320, 375, 390, 414px on `/` (logged in) and Profile tab.

---

## Build

```bash
npm run build
```

**Result:** Passed (tsc + vite build, June 2026).

---

## Remaining recommendations

1. **Dead CSS** — `dashboard.css` still contains styles for removed widgets (momentum, streak, referral). Safe to delete in a follow-up cleanup PR.
2. **Unused dashboard components** — `FirstDayJourneyCard`, `StreakBanner`, `ReferralCard`, etc. can be archived or removed if no other route imports them.
3. **Android** — Run `npx cap sync android` and bump `versionCode` before Play Console upload if this build ships to testers.
4. **Compatibility title** — Combined insight uses “Why this profile” heading; compatibility text follows below. Optional: single heading “About you” if copy testing prefers less segmentation.

---

## Success criteria

Home reads as a calm fintech welcome (greeting → discover → light activity → optional nudges), not a checklist dashboard. Me/Profile shows the person first; editing and account controls are one tap away in dedicated flows.
