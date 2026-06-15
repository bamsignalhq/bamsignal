# Profile Hero Restoration Report

**Date:** June 15, 2026  
**Goal:** Restore the social, premium profile hero (cover + centered photo) without bringing back Facebook-style clutter.

---

## Summary

The member profile overview now opens with a **modern discovery-style hero**: full-width cover, large circular avatar with gradient ring, and clean identity (name, age, city, verification only). Content sections below follow a fixed order. Edit and Settings remain the only own-profile actions — no strength bars, referral widgets, or in-hero controls.

---

## Hero structure restored

| Element | Implementation |
|---------|----------------|
| Cover image | Full width, `min(44vw, 200px)` height — moderate, not oversized |
| Blur extension | Duplicated cover layer with blur + saturate when photo is cropped |
| Centered profile photo | 112px circle, gradient ring, card border, soft shadow |
| Overlap | Avatar overlaps cover by ~58px |
| Name | Dedicated `h1`, bold typography |
| Age | Separate line below name |
| City | Map pin + formatted city/state |
| Verification | Single badge row only (tier or verified) |

**Component:** `src/components/ProfileCoverHeader.tsx`  
**Styles:** `src/styles/member-pages.css` (`.profile-hero*`)

---

## Removed from hero / overview clutter

| Removed | Reason |
|---------|--------|
| Profile strength progress bar (`profile-quiet-complete`) | Metrics overload; strength stays on Home dashboard only |
| Empty photo CTA card | Hero empty avatar state replaces it |
| In-hero Edit / Settings buttons | Actions moved below hero (unchanged placement) |
| Premium pill in header | Not part of clean hero spec |
| Cover edit button | No engine-room controls in hero |
| Multiple badges | Only verification shown |

**Not reintroduced:** referral widgets, premium upsell cards, Facebook actions, like/share controls, matching controls in hero.

---

## Own profile actions

Below hero, unchanged minimal pattern:

- **Primary:** Edit Profile
- **Secondary:** Settings (text link)

---

## Content sections (below hero)

Fixed order on overview:

1. **Bio** — always visible  
2. **Interests** — tags or gentle empty copy  
3. **Intent** — tags or gentle empty copy  
4. **Voice Intro** — only when `voiceIntroUrl` exists  
5. **Why This Profile** — highlights from `getOwnProfileHighlights()` when any exist  

**New util:** `src/utils/profileHighlights.ts` — derives positive visibility reasons (verified, voice, interests, intent, bio, city, photos) without hardcoded per-user text.

**Page:** `src/pages/ProfilePage.tsx` — class `profile-page--hero`

---

## Visual improvements

- Centered, human layout (Bumble / Hinge / host-profile feel)
- Rounded content cards with `box-shadow: var(--shadow-card)`
- Improved type hierarchy (`profile-hero__name` 1.5rem / 800 weight)
- Gradient avatar ring (`var(--brand-gradient)`)
- Soft cover shade into page background
- Consistent section spacing (`margin-bottom: 12px`, `padding: 18px`)

---

## Unchanged (by design)

| Area | Notes |
|------|-------|
| Edit profile flow | Accordion sections (basic, photos, about, interests, details) |
| Settings hub | Matching, privacy, safety, payments, account |
| Discover `ProfileDetailSheet` | Separate sheet UX for other members |
| Backend / data model | No schema changes |

---

## Files changed

```
src/components/ProfileCoverHeader.tsx   (rewritten — profile hero)
src/pages/ProfilePage.tsx               (sections reordered, clutter removed)
src/utils/profileHighlights.ts          (new)
src/styles/member-pages.css             (profile-hero styles)
PROFILE_HERO_RESTORATION_REPORT.md    (this file)
```

---

## Verification

- [x] `npm run build` passes
- [x] Hero shows cover + centered avatar + identity only
- [x] No profile strength / referral / premium in profile hero
- [x] Overview sections: Bio → Interests → Intent → Voice → Why
- [x] Single Edit + Settings on own profile

---

## Re-enable / tune later

- **Cover height:** adjust `.profile-hero__cover` `height` in `member-pages.css`
- **Second photo as cover:** could use `photos[1]` for cover when multiple photos exist
- **Feature flag:** not required for this sprint; hero is the default member profile experience
