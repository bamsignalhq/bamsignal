# Clean Intelligent Profile Page Report

**Date:** June 15, 2026  
**Sprint:** Clean Intelligent Profile Page  
**Goal:** Social, premium, human profile experience — not an engine room.

---

## Summary

The member profile and public profile sheet were simplified to **hero + content + minimal actions**. Controls, lectures, and duplicate buttons were moved into **Edit Profile** or **Settings**. Copy was shortened to calm section labels.

---

## 1. Profile hero (kept)

Unchanged structure from hero restoration:

- Cover / background image with blur extension
- Centered circular photo with gradient ring
- Name, age, city, verification badge only
- No buttons, metrics, or settings inside the hero

**Component:** `src/components/ProfileCoverHeader.tsx`

---

## 2. Buttons removed from main profile view

| Removed from overview | Where it went |
|----------------------|---------------|
| Hidden file input / Add Photo | Edit Profile → Photos |
| Profile strength % bar | Removed (Home dashboard only) |
| Instructional empty-state paragraphs | Replaced with `—` |
| Voice intro badge / recorder | Edit Profile → Voice intro |
| Intent / interest edit controls | Edit Profile |
| Privacy / safety / matching toggles | Settings |
| Premium upsell copy on overview | Settings → Payments |
| Referral widgets | Already gated off (`ENABLE_REFERRALS_UI`) |

---

## 3. Own profile actions

Overview shows **only**:

- **Edit Profile** (primary)
- **Settings** (text link)

No additional buttons on the main profile surface.

---

## 4. Public profile actions (`ProfileDetailSheet`)

| Action | Placement |
|--------|-----------|
| **Send Signal** | Primary sticky footer |
| **Pass** | Secondary sticky footer |
| **Report** | Overflow menu |
| **Block** | Overflow menu |
| **Priority Signal** | Overflow menu (premium only) |

Removed from public profile hero/footer:

- Trust micro-strip and trust badge in hero (verification only)
- “Safety options” combined menu label
- Loud third action button for priority signal
- Long compatibility subtitle paragraphs

**Discover card** (`ProfileCard`) aligned: Signal before Pass; overflow shows Report / Block.

---

## 5. Content sections (fixed order)

### Own profile overview

1. Bio  
2. Interests  
3. Looking for  
4. Voice intro *(if recorded)*  
5. Why this profile *(highlights)*  
6. Compatibility *(short read-only summary from preferences)*  

### Public profile sheet

Same order + **Compatibility** as `{n}% match`.

Section labels use short copy: Bio, Interests, Looking for, Voice intro, Why this profile, Compatibility.

Empty fields show `—` instead of coaching text.

---

## 6. Edit Profile changes

Accordion sections (all **collapsed by default**):

| Section | Contents |
|---------|----------|
| Basic info | Name, age, gender, location, looking for |
| Photos | Grid + add (edit-only) |
| Bio | Textarea |
| Interests | Interest picker |
| Looking for | Intent tags |
| Voice intro | Recorder |

**Removed from Edit Profile:**

- Combined “About” bucket
- Optional religion / ethnicity / lifestyle (moved to Settings → Preferences)

Single **Save** bar at bottom — no duplicate save buttons per section.

---

## 7. Settings changes

Hub rows (no long hint paragraphs):

- Preferences  
- Privacy  
- Safety  
- Notifications *(new — points to in-app notification center)*  
- Payments *(non-premium)*  
- Account  

**Preferences** now includes optional profile details (religion, ethnicity, lifestyle) at the bottom.

**Removed noisy copy:**

- `PREFERENCE_CULTURAL_COPY` / `ONBOARDING_CULTURAL_COPY` on settings rows  
- Privacy panel intro paragraph  
- Payments upsell paragraph  
- Verification explanatory paragraph (compact card)

---

## 8. Copy cleanup

| Before | After |
|--------|-------|
| Intent | Looking for |
| Voice Intro | Voice intro |
| Why this profile? | Why this profile |
| “Tell people a little about you.” | — |
| “Add interests that reflect…” | — |
| “Share what you're open to…” | — |
| Matching Preferences | Preferences |

---

## 9. Visual / mobile improvements

- `overflow-x: hidden` on profile page
- Overview sections in `.profile-overview-sections` with consistent 12px gap
- Rounded cards + shadow on overview sections
- Public profile body uses `.profile-detail-sheet__card` blocks
- Sticky footer: Signal-primary grid (`1.35fr 1fr auto`)
- Mobile footer: tighter columns under 420px
- Hero height capped at 200px — photo overlap does not cover name

---

## Files changed

```
src/pages/ProfilePage.tsx
src/components/ProfileDetailSheet.tsx
src/components/ProfileCard.tsx
src/components/WhyThisProfile.tsx
src/pages/DiscoverPage.tsx
src/utils/profileCompatSummary.ts          (new)
src/styles/member-pages.css
src/styles/v6.css
CLEAN_PROFILE_PAGE_REPORT.md
```

---

## Verification

- [x] `npm run build` passes
- [x] Own profile: hero + Edit/Settings + content sections only
- [x] Edit Profile: grouped accordions, single save
- [x] Settings: hub without lectures; complexity behind rows
- [x] Public sheet: Signal / Pass + Report / Block overflow
- [x] Priority Signal in overflow only

---

## Remaining recommendations

1. **Notification preferences** — Settings → Notifications is informational today; add per-channel toggles when product defines them.
2. **Second photo as cover** — Use `photos[1]` for cover when multiple photos exist for richer hero.
3. **ProfileDetailSheet hero** — Could adopt the same cover + centered avatar layout as own profile for full visual parity.
4. **Discover card overlay** — Trust micro-strip on swipe cards is still present; remove if discover should match the cleaner public profile sheet.
5. **Report flow** — Report still opens the existing modal; could open directly to reason picker from overflow (`initialView="report"`).

---

## Goal met

The profile page now reads as a **social discovery profile** — large imagery, calm sections, two actions on your own profile, three on someone else's — with engine-room complexity tucked into Edit Profile and Settings.
