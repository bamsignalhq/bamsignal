# Profile Minimalism Sprint Report

**Date:** June 15, 2026  
**Goal:** Calm, premium, mature profile UX — connection-first, not configuration-first.

---

## Summary

Profile surfaces were simplified across own profile, discover cards, and profile detail sheets. Configuration, safety, and account controls were moved behind **Edit Profile** and **Settings**. Button counts were reduced to primary + secondary + optional overflow on public profiles.

---

## Pages & components simplified

| Area | File | Change |
|------|------|--------|
| Own profile | `src/pages/ProfilePage.tsx` | Replaced 3-tab nav with overview / edit / settings views; overview is read-only |
| Profile header | `src/components/ProfileCoverHeader.tsx` | Photo + identity only; removed inline Edit photo / Edit / Settings buttons |
| Discover card | `src/components/ProfileCard.tsx` | Stripped bio, voice intro, signal moments, activity badge, safety shield, 3rd CTA row |
| Profile detail | `src/components/ProfileDetailSheet.tsx` | Lean sections + sticky Send Signal / Pass / overflow |
| Discover wiring | `src/pages/DiscoverPage.tsx` | Passes signal actions into detail sheet |
| Match reasons | `src/components/WhyThisProfile.tsx` | Compact mode capped at 2 reasons |
| Safety card | `src/components/SafetySettingsCard.tsx` | Shorter headings and toggle copy |
| Copy constants | `src/data/landingProfiles.ts` | Privacy and preference helper text shortened |

### Styles

- `src/styles/member-pages.css` — overview actions, quiet completeness, edit accordion, settings hub, photo grid
- `src/styles/discover-v2.css` — minimal card layout, reason chips, overflow menu
- `src/styles/v6.css` — detail sheet sticky actions, face-centered crop

---

## Buttons removed

### Own profile (overview)
- Section tab pills (Overview / Edit profile / Settings)
- **Edit photo** on cover header
- Duplicate **Edit profile** + **Settings** pair in header
- **Save profile** on main view
- Premium upsell block on settings hub
- Female safety info card on settings hub
- Logout / theme / verification on main overview

### Discover card
- Standalone **Safety** shield button (moved to ⋯ menu)
- **Priority Signal** as always-visible third button (moved to ⋯ menu for premium)
- Locked priority button for free users

### Profile detail sheet
- Redundant close-only flow without actions (now has sticky CTAs)

---

## Copy removed or shortened

| Before | After |
|--------|--------|
| "Help BamSignal understand the kind of people you connect with best…" | "Control what appears on your profile." |
| Long preference cultural paragraph | "Used privately to improve compatibility." |
| "Safety settings" + long apply-immediately note | "Safety" + one line |
| "Only people matching my preferences can signal me" + long filter list | "Preference matching only" + short subline |
| "DM controls — who can message me?" | "Who can message me" |
| Bio placeholder "Add a short bio so people know your vibe." | "Tell people a little about you." |
| Premium feature bullet list on profile settings | Single payments row → one upgrade CTA |
| Verification "Get a verified badge so matches know you're real." | "Confirm you're real with a quick selfie review." |

**Not changed (out of profile-page scope):** Home dashboard profile strength card, onboarding photo hint, CMS welcome copy — recommend a follow-up home/dashboard pass.

---

## Sections moved

### → Edit Profile (`ProfilePage` edit view, accordion)

- Basic Info — name, age, gender, location, looking for
- Photos — grid + add/remove
- About — bio, intent (max 2), voice intro
- Interests — picker
- Preferences — religion, ethnicity, lifestyle (optional)

Fixed **Save** bar at bottom while editing.

### → Settings hub (`ProfilePage` settings view)

| Section | Contents |
|---------|----------|
| Matching Preferences | Full match preference form (was on main settings dump) |
| Privacy | Profile visibility toggles |
| Safety | `SafetySettingsCard` only |
| Payments | Single Signal Pass CTA (non-premium) |
| Account | Verification, theme, logout, admin link |

---

## Own profile overview (now shows)

- Large cover photo (face-centered) or calm placeholder + **Add Photo**
- Name, age, city, verification badge
- Quiet **% complete** bar (no strength hints or checklist)
- Bio, intent (max 2), interests (read-only)
- **Edit Profile** (primary) + **Settings** (text link)

---

## Public profile surfaces (now show)

### Discover card
- Photo, name/age, city, compatibility %, verification, 1–2 reason chips
- **Pass** · **Send Signal** · **⋯** (safety, priority when premium)

### Detail sheet (on tap)
- Photo hero, name/age/city, verification
- Compatibility, bio, intent, interests, Why This Profile, voice intro if present
- Sticky **Pass** · **Send Signal** · **⋯**

Removed from detail: separate Photos grid section, Signal Moments, Lifestyle block, duplicate About Me.

---

## Remaining recommendations

1. **Home dashboard** — `DashboardProfileStrengthCard` and `DashboardNextSteps` still surface profile % and multiple CTAs; align with quiet completeness pattern.
2. **Onboarding** — Step 3 still uses "profiles with photos get more signals"; shorten to match edit-screen tone.
3. **Likes / Visitors rows** — List rows are already compact; optional future pass for consistency with discover minimalism.
4. **Notifications settings** — Spec listed a Notifications section; no notification prefs exist yet — add when product supports it.
5. **Photo carousel** — Detail sheet supports dots when multiple photos exist; `DiscoverProfile` currently exposes one `photo` field — wire multi-photo when backend supports it.
6. **Settings → Safety Center** — Full `SafetyCenterPage` overlay from Home unchanged; consider linking from Settings → Safety for report/block shortcuts.

---

## Mobile-first notes

- Edit save bar fixed above bottom nav with safe-area padding
- Detail sheet body padded above sticky action bar
- Discover actions use 3-column grid (Pass / Signal / overflow) with small-screen fallback in existing media query
- Profile cover uses `min(52vw, 280px)` height for proportional mobile hero
- No horizontal overflow introduced on profile overview cards

---

## Goal check

| Criterion | Status |
|-----------|--------|
| Overview feels simple, not form-like | **Done** |
| Editing behind Edit Profile + accordion | **Done** |
| Safety/account off main profile | **Done** |
| ≤3 actions on public profile | **Done** |
| Calm copy | **Done** |
| Premium photo presentation | **Done** (face crop, large hero, placeholder) |
| Settings grouped, not one dump | **Done** |
| No new features | **Done** |

Profile pages should now read as a **person**, not a **settings panel** — with configuration one tap away when needed.
