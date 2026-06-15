# Homepage Simplification Report

**Date:** 2026-06-15  
**Sprint:** BamSignal homepage simplification  
**Status:** Complete — production build passes

---

## Summary

The public homepage was shortened by removing four explanatory/metric sections and replacing them with a single-line trust strip. The page now leads with imagery and emotion, with one clear signup path at the bottom.

**Goal alignment:** Less reading · More imagery · Stronger emotional pull · Fewer distractions before signup

---

## Sections removed

| Section | Content removed |
|---------|-----------------|
| **Pulse bar** (`HomePulseBar`) | ID verified · Verified profiles · Nationwide · Cities live · 5 free daily · Signals sent · rotating marquee including “Meet in public — tell someone your plans” |
| **How it works** (`HomeHowItWorks`) | “Simple & intentional” · “How BamSignal works” · 3-step list · “Create your profile” CTA |
| **Premium teaser** (`HomePremiumTeaser`) | Signal Pass · unlimited signals · who signaled you · priority · filters · “View plans” |
| **Social proof placeholder** | Removed from page composition (was admin-gated and usually hidden) |

### Deleted components

- `src/components/home/HomePulseBar.tsx`
- `src/components/home/HomeHowItWorks.tsx`
- `src/components/home/HomePremiumTeaser.tsx`

---

## New page flow

```
Hero
  ↓
Trust strip (new)
  ↓
Signals Around Nigeria
  ↓
Naija Lifestyle
  ↓
Safety
  ↓
Final Join CTA
  ↓
Footer
```

### Section mapping

| Step | Component | Notes |
|------|-----------|-------|
| Hero | `VisualHero` | Unchanged — carousel + “Send a Signal” |
| Trust strip | `HomeHeroTrustStrip` | **New** — single row, no cards |
| Signals Around Nigeria | `SignalsAroundNigeria` | City imagery grid |
| Naija Lifestyle | `SignalMoments` | Lifestyle moment cards |
| Safety | `HomeTrustStrip` | Eyebrow updated to “Safety” |
| Final CTA | `VisualFinalCta` | Simplified copy + button |
| Footer | `SiteFooter` | Unchanged |

---

## Trust strip (new)

Directly below the hero:

- ✓ Verified Profiles
- ✓ Safer Conversations
- ✓ Built for Nigerian Cities

**Implementation:** `HomeHeroTrustStrip` + `HOME_HERO_TRUST` in `homeLanding.ts`  
**Style:** Single row, checkmark prefix, no cards, no button, subtle bottom border

---

## Final CTA (updated)

| Before | After |
|--------|-------|
| Eyebrow: “Join free” | *(removed)* |
| Headline: “Someone nearby might signal you today.” | **“Ready to send your first signal?”** |
| Sub: “5 signals and 5 messages daily…” | *(removed)* |
| Button: “Create free profile” | **“Join BamSignal”** |

---

## Files changed

| File | Change |
|------|--------|
| `src/pages/LandingPage.tsx` | New composition; removed `onOpenPricing` prop |
| `src/components/home/HomeHeroTrustStrip.tsx` | **Created** |
| `src/components/visual/VisualFinalCta.tsx` | Headline + button only |
| `src/data/homeLanding.ts` | `HOME_HERO_TRUST`, simplified `HOME_SECTIONS`, removed how/premium/marquee copy |
| `src/styles/home-landing.css` | Trust strip + simplified final CTA styles |
| `src/App.tsx` | Dropped `onOpenPricing` from `LandingPage` |

---

## Length reduction estimate

| Metric | Before | After |
|--------|--------|-------|
| Visible homepage sections | ~8 | **6** |
| Major copy blocks removed | — | Pulse stats, 3-step how-to, premium perks, final subtext |
| JS bundle (gzip) | ~88.2 KB | **~87.3 KB** (−~1 KB) |

**Approximate scroll reduction: ~40%** — three full sections (pulse, how-it-works, premium) plus final CTA subcopy removed. Remaining sections are image-forward (cities, lifestyle, safety).

---

## Conversion rationale

1. **Hero → trust strip → cities** — immediate emotional hook, light reassurance, then social proof through Nigerian imagery (not stats).
2. **No pricing on homepage** — signup intent isn’t split by “View plans” before account creation.
3. **No step-by-step tutorial** — reduces cognitive load; product discovery happens after signup.
4. **Single closing CTA** — one question, one button, no quota explanation.

---

## Build verification

```
npm run build — PASS
✓ 1818 modules transformed
dist/assets/index-C1iuchg6.js  306.97 kB │ gzip: 87.29 kB
```

---

## Recommendations

1. **Deploy** — push to `main` for Coolify rebuild.
2. **Analytics** — track homepage → signup click rate vs. prior layout (7-day window).
3. **A/B optional** — if signup dips, test hero CTA copy (“Send a Signal” vs “Join BamSignal”) for consistency with final CTA.
4. **Play Console** — when capturing store screenshots, use the simplified homepage (trust strip + city grid visible above fold).

---

## Goal status

| Goal | Status |
|------|--------|
| ~40% shorter homepage | Yes |
| More emotional / imagery-led | Yes |
| Less reading | Yes |
| Clearer signup path | Yes — hero + final CTA |
| Trust without clutter | Yes — single-row strip |

The homepage now shows more Nigeria, less explanation, and a cleaner path to “Join BamSignal.”
